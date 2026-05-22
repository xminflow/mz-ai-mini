"""research-kit CLI 入口。

子命令：
    plugins list                列出所有可用插件
    plugins inspect <name>      查看插件详情
    skill list                  列出可用 skill
    skill validate <name>       校验 skill 是否能加载
    collect / analyze / report  分阶段运行
    run                         完整 pipeline 串跑
"""

from __future__ import annotations

import sys
from pathlib import Path

# Windows 控制台默认 cp936，会让中文输出乱码。Python 3.7+ 支持运行时重配置 stdout。
for _stream in (sys.stdout, sys.stderr):
    reconfigure = getattr(_stream, "reconfigure", None)
    if reconfigure is not None:
        try:
            reconfigure(encoding="utf-8")
        except Exception:
            pass

import typer
from rich.console import Console
from rich.table import Table

from research_kit import __version__
from research_kit.core.contracts import PipelineJob, make_run_id
from research_kit.core.logging import configure_logging
from research_kit.core.pipeline import Pipeline
from research_kit.core.registry import (
    PluginRegistry,
    default_registry,
    discover_builtin_plugins,
    discover_external_plugins,
)
from research_kit.core.settings import Settings
from research_kit.core.skills import list_skills, load_skill

app = typer.Typer(
    name="research-kit",
    help="资料收集与拆解平台。首版交付抖音博主拆解。",
    no_args_is_help=True,
    add_completion=False,
)
plugins_app = typer.Typer(help="插件相关命令", no_args_is_help=True, add_completion=False)
skill_app = typer.Typer(help="skill 相关命令", no_args_is_help=True, add_completion=False)
app.add_typer(plugins_app, name="plugins")
app.add_typer(skill_app, name="skill")

console = Console()


# ===================== 全局选项 =====================


_loaded_registry: PluginRegistry | None = None
_loaded_settings: Settings | None = None


def _get_runtime(log_level: str = "INFO") -> tuple[Settings, PluginRegistry]:
    """惰性装载 settings 与插件注册表，确保单次进程只装载一次。"""
    global _loaded_registry, _loaded_settings
    configure_logging(level=log_level)
    if _loaded_settings is None:
        _loaded_settings = Settings.load()
    if _loaded_registry is None:
        reg = default_registry()
        discover_builtin_plugins(reg)
        discover_external_plugins(reg)
        _loaded_registry = reg
    return _loaded_settings, _loaded_registry


# ===================== 顶层命令 =====================


def _version_callback(value: bool) -> None:
    if value:
        console.print(f"research-kit {__version__}")
        raise typer.Exit(code=0)


@app.callback()
def main(
    log_level: str = typer.Option(
        "INFO",
        "--log-level",
        envvar="RESEARCH_KIT_LOG_LEVEL",
        help="日志级别：DEBUG / INFO / WARNING / ERROR",
    ),
    version: bool = typer.Option(
        False,
        "--version",
        callback=_version_callback,
        is_eager=True,
        help="打印版本号并退出",
    ),
) -> None:
    _get_runtime(log_level=log_level)


# ===================== plugins =====================


@plugins_app.command("list")
def plugins_list() -> None:
    """列出所有 collector / analyzer / reporter。"""
    _, registry = _get_runtime()
    snapshot = registry.all()

    table = Table(title="research-kit plugins", show_lines=True)
    table.add_column("kind", style="cyan", no_wrap=True)
    table.add_column("name", style="bold")
    table.add_column("extras", style="yellow")
    table.add_column("description")

    for info in snapshot.collectors + snapshot.analyzers + snapshot.reporters:
        extras = ", ".join(info.extras_required) or "-"
        table.add_row(info.kind, info.name, extras, info.description)
    console.print(table)


@plugins_app.command("inspect")
def plugins_inspect(name: str = typer.Argument(..., help="插件名称")) -> None:
    """打印指定插件的详细信息（在三类注册表中按名称查找）。"""
    _, registry = _get_runtime()
    for getter in (
        registry.get_collector,
        registry.get_analyzer,
        registry.get_reporter,
    ):
        try:
            plugin = getter(name)
        except KeyError:
            continue
        info = plugin.info
        console.print(f"[bold cyan]{info.kind}[/bold cyan] [bold]{info.name}[/bold]")
        console.print(f"description : {info.description}")
        console.print(f"extras      : {', '.join(info.extras_required) or '-'}")
        skill_name = getattr(plugin, "skill_name", None)
        if skill_name:
            console.print(f"skill       : {skill_name}")
        return
    console.print(f"[red]未找到插件: {name}[/red]")
    raise typer.Exit(code=1)


# ===================== skill =====================


@skill_app.command("list")
def skill_list() -> None:
    """列出所有可用 skill。"""
    settings, _ = _get_runtime()
    skills = list_skills(settings)
    if not skills:
        console.print("[yellow]当前 search_paths 中未找到任何 skill。[/yellow]")
        console.print(f"search_paths: {[str(p) for p in settings.skill_search_paths]}")
        return
    table = Table(title="skills", show_lines=True)
    table.add_column("name", style="bold")
    table.add_column("version", style="cyan")
    table.add_column("description")
    table.add_column("path", style="dim")
    for s in skills:
        table.add_row(s.name, s.version or "-", s.description or "-", str(s.path))
    console.print(table)


@skill_app.command("validate")
def skill_validate(name: str = typer.Argument(..., help="skill 名称")) -> None:
    """加载并校验指定 skill。"""
    settings, _ = _get_runtime()
    try:
        skill = load_skill(name, settings)
    except FileNotFoundError as exc:
        console.print(f"[red]{exc}[/red]")
        raise typer.Exit(code=1) from exc
    console.print(f"[green]OK[/green]: {skill.name} @ {skill.path}")
    console.print(f"description: {skill.description}")
    if skill.version:
        console.print(f"version: {skill.version}")
    console.print(f"body length: {len(skill.body)} chars")


# ===================== 单阶段命令 =====================


def _run_pipeline(
    *,
    collector: str,
    analyzer: str,
    reporter: str,
    workspace: Path,
    url: str | None,
    focus_count: int,
    sample_count: int,
    stages: list[str],
    run_id: str | None,
) -> None:
    _run_pipeline_with_options(
        collector=collector,
        analyzer=analyzer,
        reporter=reporter,
        workspace=workspace,
        url=url,
        focus_count=focus_count,
        sample_count=sample_count,
        stages=stages,
        run_id=run_id,
        options={},
    )


def _run_pipeline_with_options(
    *,
    collector: str,
    analyzer: str,
    reporter: str,
    workspace: Path,
    url: str | None,
    focus_count: int,
    sample_count: int,
    stages: list[str],
    run_id: str | None,
    options: dict[str, str],
) -> None:
    _, registry = _get_runtime()
    rid = run_id or make_run_id()
    pipeline = Pipeline(collector, analyzer, reporter, registry=registry)
    job = PipelineJob(
        run_id=rid,
        workspace=workspace.resolve(),
        url=url,
        focus_count=focus_count,
        sample_count=sample_count,
        stages=stages,  # type: ignore[arg-type]
        options=options,
    )
    try:
        outcome = pipeline.run(job)
    except NotImplementedError as exc:
        console.print(f"[yellow]阶段尚未实现：{exc}[/yellow]")
        raise typer.Exit(code=2) from exc
    except Exception as exc:
        console.print(f"[red]pipeline 失败：{exc}[/red]")
        raise typer.Exit(code=1) from exc

    console.print(f"[green]run_id={outcome.run_id} 完成。[/green]")
    if outcome.report is not None:
        for artifact in outcome.report.artifacts:
            console.print(f"  artifact: {artifact}")


@app.command("collect")
def cmd_collect(
    plugin: str = typer.Option("douyin-browser", "--plugin", help="collector 名称"),
    url: str = typer.Option(..., "--url", help="博主主页 URL"),
    workspace: Path = typer.Option(..., "--workspace", help="工作区目录（通常 output/bloggers/<blogger_slug>/raw/）"),
    sample_count: int = typer.Option(0, "--sample-count", help="采样作品数量；0 表示按总作品数自动计算（10-20）"),
    run_id: str | None = typer.Option(None, "--run-id"),
    # 浏览器选项
    headless: bool = typer.Option(False, "--headless/--headed", help="无头模式。抖音对 headless 检测严格，默认显示窗口"),
    proxy: str | None = typer.Option(None, "--proxy", envvar="HTTPS_PROXY", help="HTTPS 代理，例如 http://127.0.0.1:7078"),
    storage_state: Path | None = typer.Option(None, "--storage-state", help="Playwright storage_state.json 路径（含登录态）"),
    user_data_dir: Path | None = typer.Option(None, "--user-data-dir", help="持久化浏览器用户目录（替代 storage_state）"),
    # 转录选项
    skip_transcribe: bool = typer.Option(False, "--skip-transcribe", help="跳过 Whisper 转录"),
    skip_frames: bool = typer.Option(False, "--skip-frames", help="跳过 ffmpeg 抽帧"),
    whisper_model: str = typer.Option("large-v3", "--whisper-model", envvar="RESEARCH_KIT_WHISPER_MODEL", help="faster-whisper 模型名"),
    use_gpu: bool = typer.Option(False, "--use-gpu", help="转录使用 CUDA（需 NVIDIA GPU + cuDNN）"),
    keep_video: bool = typer.Option(False, "--keep-video", help="保留下载的 source.mp4（默认转录后删除以节省空间）"),
    frame_count: int = typer.Option(4, "--frame-count", min=1, max=10),
    sample_seed: int | None = typer.Option(None, "--sample-seed", help="抽样随机种子，用于结果可复现"),
) -> None:
    """单独执行采集阶段。"""
    options: dict[str, str] = {
        "headless": str(headless).lower(),
        "skip_transcribe": str(skip_transcribe).lower(),
        "skip_frames": str(skip_frames).lower(),
        "keep_video": str(keep_video).lower(),
        "use_gpu": str(use_gpu).lower(),
        "whisper_model": whisper_model,
        "frame_count": str(frame_count),
    }
    if proxy:
        options["proxy"] = proxy
    if storage_state:
        options["storage_state"] = str(storage_state)
    if user_data_dir:
        options["user_data_dir"] = str(user_data_dir)
    if sample_seed is not None:
        options["sample_seed"] = str(sample_seed)

    _run_pipeline_with_options(
        collector=plugin,
        analyzer="douyin-blogger",
        reporter="html-multi",
        workspace=workspace,
        url=url,
        focus_count=5,
        sample_count=sample_count,
        stages=["collect"],
        run_id=run_id,
        options=options,
    )


@app.command("analyze")
def cmd_analyze(
    plugin: str = typer.Option("douyin-blogger", "--plugin", help="analyzer 名称"),
    workspace: Path = typer.Option(..., "--workspace", help="工作区目录"),
    focus_count: int = typer.Option(5, "--focus-count", min=3, max=8),
    run_id: str | None = typer.Option(None, "--run-id"),
) -> None:
    """单独执行分析阶段。"""
    _run_pipeline(
        collector="douyin-browser",
        analyzer=plugin,
        reporter="html-multi",
        workspace=workspace,
        url=None,
        focus_count=focus_count,
        sample_count=15,
        stages=["analyze"],
        run_id=run_id,
    )


@app.command("report")
def cmd_report(
    plugin: str = typer.Option("html-multi", "--plugin", help="reporter 名称"),
    workspace: Path = typer.Option(..., "--workspace", help="工作区目录"),
    run_id: str = typer.Option(..., "--run-id", help="要整理的 run_id"),
) -> None:
    """单独执行报告整理阶段。"""
    _run_pipeline(
        collector="douyin-browser",
        analyzer="douyin-blogger",
        reporter=plugin,
        workspace=workspace,
        url=None,
        focus_count=5,
        sample_count=15,
        stages=["report"],
        run_id=run_id,
    )


@app.command("publish")
def cmd_publish(
    workspace: Path = typer.Option(
        ...,
        "--workspace",
        help="博主工作区目录（含 raw/ 与 reports/），或直接传入 raw/ 目录",
    ),
    env: str | None = typer.Option(
        None,
        "--env",
        envvar="RESEARCH_KIT_PUBLISH_ENV",
        help=(
            "命名环境（在 publish-envs.toml 的 [envs.*] 中定义）；"
            "缺省取文件中的 default。"
        ),
    ),
    envs_file: Path | None = typer.Option(
        None,
        "--envs-file",
        envvar="RESEARCH_KIT_PUBLISH_ENVS_FILE",
        help=(
            "覆盖默认 publish-envs.toml 路径；缺省按当前目录 / research-kit 项目根查找。"
        ),
    ),
    api_base: str | None = typer.Option(
        None,
        "--api-base",
        help=(
            "Weelume 后端基地址，例如 https://api.weelume.com。"
            "显式传入时覆盖 --env 选中的 api_base；也可兼容性地通过 WEELUME_API_BASE 提供。"
        ),
    ),
    token: str | None = typer.Option(
        None,
        "--token",
        help=(
            "后端 blogger_insight_import_token，通过 X-Import-Token 请求头校验。"
            "显式传入时覆盖 --env 选中的 token；缺省读取所选环境的 token_env "
            "或兼容性的 WEELUME_BLOGGER_INSIGHT_IMPORT_TOKEN。"
        ),
    ),
    platform: str = typer.Option(
        "douyin",
        "--platform",
        help="平台标识，对应后端 BloggerInsightPlatform 枚举",
    ),
    run_id: str | None = typer.Option(
        None,
        "--run-id",
        help="指定要上传的 reports/<run_id>；缺省取字典序最大的最近一次",
    ),
    slug: str | None = typer.Option(
        None,
        "--slug",
        help="自定义 slug，缺省使用 profile.json 中的 blogger_id/sec_uid",
    ),
    industry: str | None = typer.Option(
        None,
        "--industry",
        help="行业标签，例如 科技 / 教育 / 自媒体",
    ),
    positioning: str | None = typer.Option(
        None,
        "--positioning",
        help="一句话定位（卡片场景使用）",
    ),
    tags: list[str] = typer.Option(
        [],
        "--tag",
        help="补充标签，可重复传入",
    ),
    cover_image_url: str | None = typer.Option(
        None,
        "--cover-image-url",
        help="卡片封面图 URL",
    ),
    is_free: bool = typer.Option(
        False,
        "--is-free/--no-is-free",
        help="标记为免费内容（无会员也可查看），默认为会员专属",
    ),
    status: str = typer.Option(
        "published",
        "--status",
        help="published / draft",
    ),
    dry_run: bool = typer.Option(
        False,
        "--dry-run",
        help="仅打印 payload，不发起 HTTP 请求",
    ),
    skip_cos_upload: bool = typer.Option(
        False,
        "--skip-cos-upload",
        help=(
            "跳过 frame 图的 COS 上传，HTML 占位符保留原样。"
            "用于本地排查，必须配 --dry-run 一起用——保留占位符的 payload 不应真实 POST。"
        ),
    ),
    timeout: float = typer.Option(
        60.0,
        "--timeout",
        help="HTTP 超时秒数",
    ),
) -> None:
    """把 workspace 中的博主分析报告上传到 Weelume 后端。"""

    from research_kit.publishing import (
        PublishError,
        load_publish_payload,
        publish_blogger_insight,
        resolve_publish_target,
    )

    if skip_cos_upload and not dry_run:
        console.print(
            "[red]--skip-cos-upload 必须与 --dry-run 同时使用："
            "保留 data-rk-frame 占位符的 HTML 上传到后端会渲染失败。[/red]"
        )
        raise typer.Exit(code=1)

    try:
        target = resolve_publish_target(
            env_name=env,
            api_base_override=api_base,
            token_override=token,
            envs_file=envs_file,
        )
    except PublishError as exc:
        console.print(f"[red]环境解析失败：{exc}[/red]")
        raise typer.Exit(code=1) from exc

    try:
        payload = load_publish_payload(
            workspace=workspace,
            platform=platform,
            run_id=run_id,
            slug_override=slug,
            industry=industry,
            positioning=positioning,
            tags=tuple(tags),
            cover_image_url=cover_image_url,
            is_free=is_free,
            status=status,
            skip_cos_upload=skip_cos_upload,
        )
    except PublishError as exc:
        console.print(f"[red]解析失败：{exc}[/red]")
        raise typer.Exit(code=1) from exc

    env_label = target.env_name or "(未命名)"
    console.print(
        f"[bold]准备上传：[/bold] env={env_label} api_base={target.api_base} "
        f"slug={payload.slug} display={payload.display_name} "
        f"platform={payload.platform} status={payload.status} run={payload.source_run_id}"
    )
    console.print(
        f"  fans={payload.fans_count} works={payload.total_works_count} "
        f"report_html={len(payload.report_html)} chars"
    )

    if dry_run:
        console.print("[yellow]--dry-run 已开启，跳过 HTTP 上传。[/yellow]")
        return

    try:
        result = publish_blogger_insight(
            payload=payload,
            api_base=target.api_base,
            token=target.token,
            timeout_seconds=timeout,
        )
    except PublishError as exc:
        console.print(f"[red]上传失败：{exc}[/red]")
        raise typer.Exit(code=1) from exc

    console.print(
        f"[green]上传成功[/green]: env={env_label} slug={result.slug} "
        f"display={result.display_name} published_at={result.published_at}"
    )


@app.command("publish-track")
def cmd_publish_track(
    workspace: Path = typer.Option(
        ...,
        "--workspace",
        help=(
            "赛道工作区目录（含 reports/<run_id>/index.json），"
            "也可直接传入 reports/<run_id> 或 reports 目录"
        ),
    ),
    env: str | None = typer.Option(
        None,
        "--env",
        envvar="RESEARCH_KIT_PUBLISH_ENV",
        help=(
            "命名环境（在 publish-envs.toml 的 [envs.*] 中定义）；"
            "缺省取文件中的 default。"
        ),
    ),
    envs_file: Path | None = typer.Option(
        None,
        "--envs-file",
        envvar="RESEARCH_KIT_PUBLISH_ENVS_FILE",
        help="覆盖默认 publish-envs.toml 路径",
    ),
    api_base: str | None = typer.Option(
        None,
        "--api-base",
        help="Weelume 后端基地址，覆盖 --env 选中的 api_base",
    ),
    token: str | None = typer.Option(
        None,
        "--token",
        help=(
            "后端 track_analysis_import_token，通过 X-Import-Token 请求头校验。"
            "显式传入时覆盖环境配置；缺省读取 WEELUME_TRACK_ANALYSIS_IMPORT_TOKEN"
            "（或所选环境 publish-envs.toml 中的 track_token_env 字段指定的变量）。"
        ),
    ),
    run_id: str | None = typer.Option(
        None,
        "--run-id",
        help="指定要上传的 reports/<run_id>；缺省取字典序最大的最近一次",
    ),
    slug: str | None = typer.Option(
        None,
        "--slug",
        help=(
            "自定义 slug。缺省使用 index.json.track_slug，"
            "若仍缺失则退回 workspace 目录名。"
        ),
    ),
    industry: str | None = typer.Option(
        None,
        "--industry",
        help="行业标签（用于卡片筛选），例如 AI/内容 / 教育 / 出海",
    ),
    tags: list[str] = typer.Option(
        [],
        "--tag",
        help="补充标签，可重复传入",
    ),
    cover_image_url: str | None = typer.Option(
        None,
        "--cover-image-url",
        help="卡片封面图 URL（可选）",
    ),
    is_free: bool = typer.Option(
        False,
        "--is-free/--no-is-free",
        help="标记为免费内容（无会员也可查看），默认为会员专属",
    ),
    status: str = typer.Option(
        "published",
        "--status",
        help="published / draft",
    ),
    dry_run: bool = typer.Option(
        False,
        "--dry-run",
        help="仅打印 payload 概要，不发起 HTTP 请求",
    ),
    timeout: float = typer.Option(
        60.0,
        "--timeout",
        help="HTTP 超时秒数",
    ),
) -> None:
    """把 workspace 中的赛道分析报告上传到 Weelume 后端。"""

    from research_kit.publishing import (
        PublishError,
        load_track_publish_payload,
        publish_track_analysis,
        resolve_track_publish_target,
    )

    try:
        target = resolve_track_publish_target(
            env_name=env,
            api_base_override=api_base,
            token_override=token,
            envs_file=envs_file,
        )
    except PublishError as exc:
        console.print(f"[red]环境解析失败：{exc}[/red]")
        raise typer.Exit(code=1) from exc

    try:
        payload = load_track_publish_payload(
            workspace=workspace,
            run_id=run_id,
            slug_override=slug,
            industry_override=industry,
            extra_tags=tuple(tags),
            cover_image_url=cover_image_url,
            is_free=is_free,
            status=status,
        )
    except PublishError as exc:
        console.print(f"[red]解析失败：{exc}[/red]")
        raise typer.Exit(code=1) from exc

    env_label = target.env_name or "(未命名)"
    total_html_bytes = sum(len(r.html.encode("utf-8")) for r in payload.reports)
    console.print(
        f"[bold]准备上传赛道：[/bold] env={env_label} api_base={target.api_base} "
        f"slug={payload.slug} keyword={payload.track_keyword} stance={payload.stance} "
        f"status={payload.status} run={payload.source_run_id}"
    )
    console.print(
        f"  region={payload.region} audience={payload.audience} "
        f"industry={payload.industry} tags={list(payload.tags)} "
        f"reports={len(payload.reports)} total_html={total_html_bytes} bytes"
    )
    for report in payload.reports:
        console.print(
            f"    - {report.key}: {report.title} "
            f"(sections={report.sections}, charts={report.charts}, "
            f"html={len(report.html)} chars)"
        )

    if dry_run:
        console.print("[yellow]--dry-run 已开启，跳过 HTTP 上传。[/yellow]")
        return

    try:
        result = publish_track_analysis(
            payload=payload,
            api_base=target.api_base,
            token=target.token,
            timeout_seconds=timeout,
        )
    except PublishError as exc:
        console.print(f"[red]上传失败：{exc}[/red]")
        raise typer.Exit(code=1) from exc

    console.print(
        f"[green]上传成功[/green]: env={env_label} slug={result.slug} "
        f"keyword={result.track_keyword} published_at={result.published_at}"
    )


@app.command("run")
def cmd_run(
    collector: str = typer.Option("douyin-browser", "--collector"),
    analyzer: str = typer.Option("douyin-blogger", "--analyzer"),
    reporter: str = typer.Option("html-multi", "--reporter"),
    url: str = typer.Option(..., "--url"),
    workspace: Path = typer.Option(..., "--workspace"),
    focus_count: int = typer.Option(5, "--focus-count", min=3, max=8),
    sample_count: int = typer.Option(15, "--sample-count"),
    run_id: str | None = typer.Option(None, "--run-id"),
) -> None:
    """完整 collect → analyze → report pipeline。"""
    _run_pipeline(
        collector=collector,
        analyzer=analyzer,
        reporter=reporter,
        workspace=workspace,
        url=url,
        focus_count=focus_count,
        sample_count=sample_count,
        stages=["collect", "analyze", "report"],
        run_id=run_id,
    )


@app.command("video-collect")
def cmd_video_collect(
    url: str = typer.Option(..., "--url", help="单条抖音视频 URL（分享链接 / 完整链接 / v.douyin.com 短链）"),
    workspace_root: Path = typer.Option(
        Path("output/videos"),
        "--workspace-root",
        help="输出根目录；视频产物写入 <workspace-root>/<aweme_id>/",
    ),
    proxy: str | None = typer.Option(None, "--proxy", envvar="HTTPS_PROXY", help="HTTPS 代理，例如 http://127.0.0.1:7078"),
    keep_video: bool = typer.Option(False, "--keep-video", help="保留下载的 video.mp4（默认转录后删除）"),
    skip_transcribe: bool = typer.Option(False, "--skip-transcribe", help="跳过转录（只抓元数据和关键帧）"),
    skip_frames: bool = typer.Option(False, "--skip-frames", help="跳过 ffmpeg 抽帧"),
    frame_count: int = typer.Option(4, "--frame-count", min=1, max=8, help="抽帧数量"),
) -> None:
    """下载单条抖音视频，提取元数据 / 关键帧 / 转录，写入 workspace-root/<aweme_id>/。"""
    import json as _json

    from research_kit.collectors.single_video.runner import (
        VideoCollectOptions,
        run_video_collect,
    )

    opts = VideoCollectOptions(
        proxy=proxy,
        keep_video=keep_video,
        skip_transcribe=skip_transcribe,
        skip_frames=skip_frames,
        frame_count=frame_count,
    )
    result = run_video_collect(url, workspace_root.resolve(), options=opts)
    summary = {
        "ok": not any("video_download" in f for f in result.failures),
        "aweme_id": result.aweme_id,
        "workspace": str(result.workspace),
        "title": result.meta.title[:80],
        "duration_seconds": result.meta.duration_seconds,
        "frames": len(result.frame_paths),
        "transcript_ok": result.transcript_ok,
        "failures": result.failures,
    }
    console.print_json(_json.dumps(summary, ensure_ascii=False))
    if not summary["ok"]:
        raise typer.Exit(code=1)


if __name__ == "__main__":  # pragma: no cover
    sys.exit(app())
