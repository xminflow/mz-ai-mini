"""douyin_browser collector 的执行编排。

链路（与 ua-agent 同款）：
1. 浏览器打开主页 → 抓 profile + 滚动作品列表 + 分层抽样
2. 对每条采样作品：
   - download.py：iesdouyin.com 解析 + 流式下载 mp4
   - frames.py：ffmpeg 抽 4 帧 + 提取 16kHz mono WAV
   - transcribe.py：subprocess 调 ua-agent funasr-nano CLI 做转录
   - 写入 workspace
"""

from __future__ import annotations

import json
import random
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from research_kit.collectors.douyin_browser.browser import browser_session
from research_kit.collectors.douyin_browser.download import download_video
from research_kit.collectors.douyin_browser.frames import (
    extract_audio,
    extract_key_frames,
    probe_duration_seconds,
)
from research_kit.collectors.douyin_browser.profile import (
    download_avatar,
    expand_bio_if_truncated,
    extract_all_works,
    read_profile,
    scroll_works_to_bottom,
    wait_for_stats,
)
from research_kit.collectors.douyin_browser.sampling import default_k, stratified_sample
from research_kit.collectors.douyin_browser.transcribe import transcribe_audio
from research_kit.collectors.douyin_browser.urls import (
    extract_aweme_id,
    extract_sec_uid,
    normalize_profile_url,
)
from research_kit.core.contracts import BloggerProfile, CollectJob, CollectResult, VideoSample
from research_kit.core.logging import get_logger
from research_kit.core.workspace import Workspace

_log = get_logger(__name__)


@dataclass(slots=True)
class CollectorOptions:
    """从 CollectJob.options 解出来的运行时参数。"""

    headless: bool = False
    proxy: str | None = None
    storage_state: Path | None = None
    user_data_dir: Path | None = None
    cookies_path: Path | None = None
    keep_video: bool = False
    skip_transcribe: bool = False
    skip_frames: bool = False
    whisper_model: str = ""  # 兼容性占位；ua-agent funasr 自带模型
    whisper_cache_dir: Path | None = None  # 兼容性占位
    use_gpu: bool = False  # 兼容性占位；ua-agent 自动检测 CUDA
    frame_count: int = 4
    sample_seed: int | None = None

    @classmethod
    def from_dict(cls, raw: dict[str, str]) -> "CollectorOptions":
        def _bool(key: str, default: bool) -> bool:
            v = raw.get(key)
            if v is None:
                return default
            return v.lower() in {"1", "true", "yes", "on"}

        def _path(key: str) -> Path | None:
            v = raw.get(key)
            return Path(v).expanduser().resolve() if v else None

        def _int(key: str, default: int) -> int:
            v = raw.get(key)
            return int(v) if v is not None else default

        return cls(
            headless=_bool("headless", False),
            proxy=raw.get("proxy"),
            storage_state=_path("storage_state"),
            user_data_dir=_path("user_data_dir"),
            cookies_path=_path("cookies_path"),
            keep_video=_bool("keep_video", False),
            skip_transcribe=_bool("skip_transcribe", False),
            skip_frames=_bool("skip_frames", False),
            whisper_model=raw.get("whisper_model", ""),
            whisper_cache_dir=_path("whisper_cache_dir"),
            use_gpu=_bool("use_gpu", False),
            frame_count=_int("frame_count", 4),
            sample_seed=int(raw["sample_seed"]) if raw.get("sample_seed") else None,
        )


def run_collect(job: CollectJob) -> CollectResult:
    """执行一次采集。把数据写入 `job.workspace`，返回 CollectResult。"""
    opts = CollectorOptions.from_dict(job.options)
    workspace = Workspace(job.workspace)
    workspace.ensure()

    profile_url = normalize_profile_url(job.url)
    _log.info("开始采集 profile_url=%s workspace=%s", profile_url, workspace.root)

    samples: list[VideoSample] = []
    failures: list[str] = []
    captured_at = _now_iso()
    profile: BloggerProfile | None = None
    total_works = 0
    scrolls = 0
    reached_bottom = False
    k = 0
    picks: list = []

    # ---------- 浏览器阶段：开主页 -> 抓资料 -> 滚动列表 -> 提取作品 ----------
    with browser_session(
        headless=opts.headless,
        proxy=opts.proxy,
        storage_state=opts.storage_state,
        user_data_dir=opts.user_data_dir,
    ) as handle:
        handle.navigate(profile_url, wait_ms=1500)

        # 抖音 stats（关注/粉丝/获赞）数字异步注入，骨架先到、数字后到。
        # navigate 完后必须等到至少一个 stats 容器出现数字，否则 read_profile
        # 拿到的全是空字符串 -> follower/following/liked 全为 null。
        wait_for_stats(handle, timeout_ms=12000)

        # 抖音主页的"个人简介"超过 ~25 字会被截断成"……更多"形式，需要 hover
        # 那个"更多"按钮触发 popover 展开才能拿到完整 signature。
        # 这一步即使失败也不影响主流程（profile.py 内 fallback selector 仍会尝试），
        # 失败原因会在 warn 级别日志中体现。
        try:
            expand_result = expand_bio_if_truncated(handle)
            _log.info("expand_bio_if_truncated 结果: %s", expand_result)
        except Exception as exc:
            _log.warning("expand_bio_if_truncated 异常（不阻断）: %s", exc)

        profile_fields = read_profile(handle)
        if profile_fields.get("display_name") is None and profile_fields.get(
            "fans_count"
        ) is None:
            raise RuntimeError(
                "未能解析博主资料。可能原因：主页改版 / 需要登录 / URL 错误。"
            )

        _log.info("开始滚动加载作品列表…")
        scrolls, card_count, reached_bottom = scroll_works_to_bottom(
            handle,
            on_progress=lambda s, c: _log.debug("scroll=%d cards=%d", s, c),
        )
        _log.info(
            "滚动完成: scrolls=%d cards=%d reached_bottom=%s",
            scrolls,
            card_count,
            reached_bottom,
        )

        works = extract_all_works(handle)
        total_works = len(works)
        if total_works == 0:
            raise RuntimeError("未能从主页解析到任何作品。可能需要登录。")
        _log.info("从主页提取到 %d 条作品", total_works)

        # 抽样
        k = job.sample_count if job.sample_count else default_k(total_works)
        rng = None
        if opts.sample_seed is not None:
            import random as _rand

            rng = _rand.Random(opts.sample_seed)
        picks = stratified_sample(works, k, rng=rng)
        _log.info("分层抽样: k=%d -> 选中 %d 条", k, len(picks))

        # 写 profile.json / sampling.json
        sec_uid_value = profile_fields.get("sec_uid") or extract_sec_uid(profile_url) or ""
        blogger_id = sec_uid_value or (profile_fields.get("douyin_id") or "unknown")

        # 头像本地化：抖音 CDN 当前不验 Referer，但 URL 携带的 `?from=xxx`
        # 是字节内部来源标记，未来可能升级成短期签名。直接外链到官网会有断链/风控风险，
        # 因此采集阶段就拉到 workspace 下，后续报告与官网部署都用本地文件。
        avatar_url_value = profile_fields.get("avatar_url")
        avatar_path_rel: Path | None = None
        if avatar_url_value:
            avatar_abs = workspace.root / "avatar.jpg"
            try:
                download_avatar(avatar_url_value, avatar_abs, proxy=opts.proxy)
                avatar_path_rel = Path("avatar.jpg")
            except Exception as exc:
                _log.warning("头像下载失败（不阻断主流程）: %s", exc)

        profile = BloggerProfile(
            blogger_id=blogger_id,
            display_name=profile_fields.get("display_name") or "未知博主",
            home_url=profile_url,
            sec_uid=sec_uid_value or None,
            douyin_id=profile_fields.get("douyin_id"),
            avatar_url=avatar_url_value,
            avatar_path=avatar_path_rel,
            description=profile_fields.get("signature"),
            follower_count=profile_fields.get("fans_count"),
            following_count=profile_fields.get("follow_count"),
            liked_count=profile_fields.get("liked_count"),
            total_works_count=total_works,
            captured_at=_now_iso(),
        )
        workspace.write_profile(profile)
        workspace.write_sampling_meta(
            {
                "k": k,
                "seed": opts.sample_seed,
                "total_works": total_works,
                "reached_bottom": reached_bottom,
                "scrolls": scrolls,
                "captured_at": _now_iso(),
            }
        )
    # 浏览器在这里关闭。下面的下载/抽帧/转录纯 HTTP + 本地命令。

    # ---------- 逐条下载 mp4 → 抽帧 → 提取 WAV → 转录 ----------
    # 幂等跳过：先扫描已完整的样本，加入 samples 列表，对应的网络/转录全部跳过。
    # 完整 = meta.json + transcript.txt + 4 张帧都齐全（除非用户禁用了对应阶段）。
    require_transcript = not opts.skip_transcribe
    require_frames = not opts.skip_frames
    skipped_count = 0
    pending_picks: list[tuple[int, dict]] = []
    for position, work in enumerate(picks):
        url = work["url"]
        aweme_id = extract_aweme_id(url) or f"unknown-{position}"
        if workspace.is_sample_complete(
            aweme_id,
            require_transcript=require_transcript,
            require_frames=require_frames,
            frame_count=opts.frame_count,
        ):
            # 复用已有 meta.json，确保 samples 列表里也有这一条
            try:
                existing_meta = workspace.sample_dir(aweme_id) / "meta.json"
                sample = VideoSample.model_validate_json(existing_meta.read_text(encoding="utf-8"))
                samples.append(sample)
                skipped_count += 1
                _log.info(
                    "[%d/%d] 跳过已完整样本 %s（aweme=%s）",
                    position + 1,
                    len(picks),
                    (work.get("title") or url)[:50],
                    aweme_id,
                )
                continue
            except Exception as exc:
                _log.warning("已有 meta.json 解析失败，将重新采集 %s: %s", aweme_id, exc)
        pending_picks.append((position, work))

    if skipped_count > 0:
        _log.info("幂等跳过 %d 条已完整样本，剩 %d 条待采", skipped_count, len(pending_picks))

    # 作品之间加随机延迟，避免短时间对 iesdouyin / aweme.snssdk.com 多次解析触发反爬。
    # 抖音的速率限制窗口在 15-60s 量级，5-10s 的间隔能让连续请求看起来不那么"机器"。
    inter_sample_sleep_range = (5.0, 10.0)
    assert profile is not None
    for idx, (position, work) in enumerate(pending_picks):
        if idx > 0:
            wait = random.uniform(*inter_sample_sleep_range)
            _log.debug("样本间随机延迟 %.1fs", wait)
            time.sleep(wait)
        url = work["url"]
        title = work.get("title") or url
        aweme_id = extract_aweme_id(url) or f"unknown-{position}"
        sample_dir = workspace.sample_dir(aweme_id)
        sample_dir.mkdir(parents=True, exist_ok=True)
        _log.info("[%d/%d] 处理作品 %s", idx + 1, len(pending_picks), title[:60])

        video_path = sample_dir / "source.mp4"
        try:
            # 1. 下载视频（iesdouyin 解析 + 流式下载，自带 403 重试）
            if not (video_path.exists() and video_path.stat().st_size > 0):
                download_video(url, video_path, proxy=opts.proxy)

            duration = probe_duration_seconds(video_path)

            # 2. 抽帧
            frame_paths: list[Path] = []
            if not opts.skip_frames:
                try:
                    frame_paths = extract_key_frames(
                        video_path, sample_dir, frame_count=opts.frame_count
                    )
                except Exception as exc:
                    failures.append(f"{aweme_id}: 抽帧失败 {exc}")
                    _log.warning("抽帧失败 %s: %s", aweme_id, exc)

            # 3. 转录（先 ffmpeg 提取 16kHz mono WAV，再调 ua-agent funasr）
            transcript_path: Path | None = None
            if not opts.skip_transcribe:
                audio_path = sample_dir / "audio.wav"
                try:
                    extract_audio(video_path, audio_path)
                    transcript = transcribe_audio(audio_path)
                    transcript_path = workspace.write_sample_transcript(aweme_id, transcript)
                except Exception as exc:
                    failures.append(f"{aweme_id}: 转录失败 {exc}")
                    _log.warning("转录失败 %s: %s", aweme_id, exc)
                finally:
                    try:
                        audio_path.unlink(missing_ok=True)
                    except Exception:
                        pass

            # 4. 清理视频（除非用户要求保留）
            if not opts.keep_video:
                try:
                    video_path.unlink(missing_ok=True)
                except Exception:
                    pass

            sample = VideoSample(
                aweme_id=aweme_id,
                title=title,
                url=url,
                position=position,
                duration_seconds=duration if duration > 0 else None,
                transcript_path=transcript_path,
                frame_paths=frame_paths,
                captured_at=captured_at,
            )
            workspace.write_sample_meta(sample)
            samples.append(sample)
        except Exception as exc:
            failures.append(f"{aweme_id}: 整体失败 {exc}")
            _log.error("作品采集失败 %s: %s", aweme_id, exc)
            continue

    _log.info("采集完成：%d/%d 条成功，失败 %d 条", len(samples), len(picks), len(failures))

    summary = {
        "ok": True,
        "blogger_id": profile.blogger_id,
        "display_name": profile.display_name,
        "workspace": str(workspace.root),
        "total_works": total_works,
        "samples_collected": len(samples),
        "samples_failed": len(failures),
        "failures": failures[:10],
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))

    return CollectResult(
        run_id=job.run_id,
        blogger=profile,
        samples=samples,
        workspace=workspace.root,
        failures=failures,
    )


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


__all__ = ["CollectorOptions", "run_collect"]
