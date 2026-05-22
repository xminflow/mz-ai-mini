"""publish 阶段把 data-rk-frame 占位符上传 COS 并改写 HTML 的单测。

为什么不连真 COS：
  · 单测必须可在 CI / 离线开发机跑过；
  · 用 FakeUploader 注入 ``FrameUploader`` 协议，验证业务逻辑（扫描 / 缓存 /
    缺文件处理 / object key 命名），COS SDK 已在真依赖里自带契约。
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import pytest

from research_kit.publishing import (
    DEFAULT_COS_KEY_PREFIX,
    HtmlRewriteResult,
    rewrite_html_frames_to_cos,
)


@dataclass
class FakeUploader:
    """记录每次 upload 的 (local_path, object_key)，返回可预测的伪 URL。"""

    base_url: str = "https://fake-bucket.cos.example.com"
    calls: list[tuple[Path, str]] = field(default_factory=list)

    def upload_file(self, *, local_path: Path, object_key: str) -> str:
        self.calls.append((local_path, object_key))
        return f"{self.base_url}/{object_key}"


@pytest.fixture()
def raw_workspace(tmp_path: Path) -> Path:
    """造一个仿真的 workspace：
      · raw/avatar.jpg
      · raw/<aweme_id>/1.jpg
      · raw/<aweme_id>/3.jpg
    """

    raw = tmp_path / "raw"
    raw.mkdir()
    # 字节够大，避免被 "< 256 字节疑似残留" 的判断丢弃。
    payload = b"\xff\xd8\xff" + (b"x" * 1024)
    (raw / "avatar.jpg").write_bytes(payload)
    (raw / "7637902663966838042").mkdir()
    (raw / "7637902663966838042" / "1.jpg").write_bytes(payload)
    (raw / "7637902663966838042" / "3.jpg").write_bytes(payload)
    (raw / "7571846145677249830").mkdir()
    (raw / "7571846145677249830" / "2.jpg").write_bytes(payload)
    return raw


def test_rewrites_each_placeholder_with_cos_url(raw_workspace: Path) -> None:
    html = """
    <img data-rk-frame="avatar.jpg" />
    <img data-rk-frame="7637902663966838042/1.jpg" />
    <img data-rk-frame="7637902663966838042/3.jpg" />
    """.strip()
    uploader = FakeUploader()

    result = rewrite_html_frames_to_cos(
        html=html,
        raw_dir=raw_workspace,
        uploader=uploader,
        slug="jianghushuoIP",
        run_id="20260520T133355Z",
    )

    assert isinstance(result, HtmlRewriteResult)
    assert "data-rk-frame=" not in result.html
    assert (
        'src="https://fake-bucket.cos.example.com/blogger-insights/jianghushuoIP/'
        '20260520T133355Z/avatar.jpg"'
    ) in result.html
    assert (
        'src="https://fake-bucket.cos.example.com/blogger-insights/jianghushuoIP/'
        '20260520T133355Z/7637902663966838042_1.jpg"'
    ) in result.html
    assert (
        'src="https://fake-bucket.cos.example.com/blogger-insights/jianghushuoIP/'
        '20260520T133355Z/7637902663966838042_3.jpg"'
    ) in result.html
    assert result.missing == ()
    # 3 张不同的图，每张只上传一次。
    assert len(uploader.calls) == 3


def test_duplicate_placeholders_upload_once(raw_workspace: Path) -> None:
    """同一个 rel 在 HTML 里出现多次，只触发一次 COS 上传，但所有占位符都被改写。"""

    html = """
    <img data-rk-frame="avatar.jpg" />
    <img data-rk-frame="avatar.jpg" />
    """.strip()
    uploader = FakeUploader()

    result = rewrite_html_frames_to_cos(
        html=html,
        raw_dir=raw_workspace,
        uploader=uploader,
        slug="jianghushuoIP",
        run_id="20260520T133355Z",
    )

    assert result.html.count('src="https://') == 2
    assert len(uploader.calls) == 1
    assert result.uploaded == {
        "avatar.jpg": (
            "https://fake-bucket.cos.example.com/blogger-insights/"
            "jianghushuoIP/20260520T133355Z/avatar.jpg"
        )
    }


def test_missing_local_file_keeps_placeholder(raw_workspace: Path) -> None:
    """本地文件不存在时保留原占位符，并把 rel 计入 missing。"""

    html = '<img data-rk-frame="never_collected/9.jpg" />'
    uploader = FakeUploader()

    result = rewrite_html_frames_to_cos(
        html=html,
        raw_dir=raw_workspace,
        uploader=uploader,
        slug="jianghushuoIP",
        run_id="20260520T133355Z",
    )

    assert 'data-rk-frame="never_collected/9.jpg"' in result.html
    assert result.missing == ("never_collected/9.jpg",)
    assert uploader.calls == []


def test_workspace_traversal_is_blocked(raw_workspace: Path) -> None:
    """data-rk-frame="../escape" 这种越界路径必须拒绝，不能上传 workspace 之外的文件。"""

    outside = raw_workspace.parent / "secret.txt"
    outside.write_bytes(b"this should never be uploaded" * 32)

    html = '<img data-rk-frame="../secret.txt" />'
    uploader = FakeUploader()

    result = rewrite_html_frames_to_cos(
        html=html,
        raw_dir=raw_workspace,
        uploader=uploader,
        slug="jianghushuoIP",
        run_id="20260520T133355Z",
    )

    # 占位符保留 + 没有触发上传。
    assert 'data-rk-frame="../secret.txt"' in result.html
    assert uploader.calls == []


def test_custom_key_prefix_is_respected(raw_workspace: Path) -> None:
    html = '<img data-rk-frame="avatar.jpg" />'
    uploader = FakeUploader()

    result = rewrite_html_frames_to_cos(
        html=html,
        raw_dir=raw_workspace,
        uploader=uploader,
        slug="jianghushuoIP",
        run_id="20260520T133355Z",
        key_prefix="custom/prefix",
    )

    assert (
        "custom/prefix/jianghushuoIP/20260520T133355Z/avatar.jpg"
        in result.html
    )
    # 默认前缀也确认一下，防止常量被悄悄改名。
    assert DEFAULT_COS_KEY_PREFIX == "blogger-insights"
