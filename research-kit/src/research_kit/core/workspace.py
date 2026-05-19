"""工作区目录管理。

目录约定（与 ua-agent userData/blogger-frames/<id>/ 兼容）：

    <workspace>/
    ├── profile.json
    ├── sampling.json
    ├── <aweme_id>/
    │   ├── meta.json
    │   ├── transcript.txt
    │   ├── 1.jpg ~ 4.jpg
    │   └── source.mp4
    ├── runs/<run_id>/
    │   ├── analysis.log
    │   └── llm_messages.jsonl
    └── reports/<run_id>/
        ├── overview.html
        ├── video_<id>.html × N
        └── index.json
"""

from __future__ import annotations

import json
from pathlib import Path

from research_kit.core.contracts import BloggerProfile, VideoSample
from research_kit.core.logging import get_logger

_log = get_logger(__name__)


class Workspace:
    """workspace 目录的读写包装。所有方法保持幂等。"""

    def __init__(self, root: Path) -> None:
        self.root = root.resolve()

    # ---------- 目录获取 ----------

    def ensure(self) -> None:
        """确保根目录存在。"""
        self.root.mkdir(parents=True, exist_ok=True)

    def sample_dir(self, aweme_id: str) -> Path:
        return self.root / aweme_id

    def runs_dir(self, run_id: str) -> Path:
        return self.root / "runs" / run_id

    def reports_dir(self, run_id: str) -> Path:
        return self.root / "reports" / run_id

    # ---------- profile ----------

    def write_profile(self, profile: BloggerProfile) -> Path:
        self.ensure()
        path = self.root / "profile.json"
        path.write_text(profile.model_dump_json(indent=2), encoding="utf-8")
        _log.debug("写入 profile.json: %s", path)
        return path

    def read_profile(self) -> BloggerProfile:
        path = self.root / "profile.json"
        if not path.exists():
            raise FileNotFoundError(f"未找到 profile.json：{path}")
        return BloggerProfile.model_validate_json(path.read_text(encoding="utf-8"))

    # ---------- samples ----------

    def write_sample_meta(self, sample: VideoSample) -> Path:
        sample_dir = self.sample_dir(sample.aweme_id)
        sample_dir.mkdir(parents=True, exist_ok=True)
        path = sample_dir / "meta.json"
        path.write_text(sample.model_dump_json(indent=2), encoding="utf-8")
        _log.debug("写入 sample meta: %s", path)
        return path

    def write_sample_transcript(self, aweme_id: str, transcript: str) -> Path:
        sample_dir = self.sample_dir(aweme_id)
        sample_dir.mkdir(parents=True, exist_ok=True)
        path = sample_dir / "transcript.txt"
        path.write_text(transcript, encoding="utf-8")
        _log.debug("写入 transcript: %s（%d 字符）", path, len(transcript))
        return path

    def is_sample_complete(
        self,
        aweme_id: str,
        *,
        require_transcript: bool = True,
        require_frames: bool = True,
        frame_count: int = 4,
    ) -> bool:
        """判断一条作品是否已经完整采集，可被本轮 collect 跳过。

        判定标准：
        - meta.json 存在且能 json 解析
        - require_transcript 为真时，transcript.txt 存在且非空
        - require_frames 为真时，1.jpg..N.jpg 全部存在且非空
        - 若 require_frames 但 frame_count=0 则不检查帧

        任一项不满足则视为不完整，需要重新跑。
        """
        sample_dir = self.sample_dir(aweme_id)
        if not sample_dir.is_dir():
            return False
        meta = sample_dir / "meta.json"
        if not meta.exists() or meta.stat().st_size == 0:
            return False
        try:
            VideoSample.model_validate_json(meta.read_text(encoding="utf-8"))
        except Exception:
            return False
        if require_transcript:
            transcript = sample_dir / "transcript.txt"
            if not transcript.exists() or transcript.stat().st_size == 0:
                return False
        if require_frames and frame_count > 0:
            for i in range(1, frame_count + 1):
                frame = sample_dir / f"{i}.jpg"
                if not frame.exists() or frame.stat().st_size == 0:
                    return False
        return True

    def iter_samples(self) -> list[VideoSample]:
        """枚举所有作品子目录中的 meta.json，返回按 position 升序排序的样本列表。"""
        samples: list[VideoSample] = []
        if not self.root.exists():
            return samples
        for child in sorted(self.root.iterdir()):
            if not child.is_dir() or child.name in {"runs", "reports"}:
                continue
            meta = child / "meta.json"
            if not meta.exists():
                continue
            try:
                samples.append(VideoSample.model_validate_json(meta.read_text(encoding="utf-8")))
            except Exception as exc:  # pragma: no cover - 容错日志
                _log.warning("解析 sample meta 失败 %s: %s", meta, exc)
        samples.sort(key=lambda s: s.position)
        return samples

    # ---------- sampling 元信息 ----------

    def write_sampling_meta(self, payload: dict[str, object]) -> Path:
        self.ensure()
        path = self.root / "sampling.json"
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        return path

    def read_sampling_meta(self) -> dict[str, object]:
        path = self.root / "sampling.json"
        if not path.exists():
            return {}
        return json.loads(path.read_text(encoding="utf-8"))


__all__ = ["Workspace"]
