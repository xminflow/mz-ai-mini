"""在本地 Linux 打包模板，在已有 COS 客户端中发布并验证公开下载。"""
from __future__ import annotations

import argparse
import hashlib
import json
import logging
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import tempfile
from typing import Protocol, TypedDict, cast
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
LOG = logging.getLogger("template-release")


class Repository(TypedDict):
    id: str
    localPath: str
    commit: str


class Catalog(TypedDict):
    repositories: list[Repository]


class PackageRecord(TypedDict):
    version: str
    sourceCommit: str
    sha256: str
    size: int
    file: str
    snapshotSha256: str | None


class StorageClient(Protocol):
    def upload_bytes(self, *, content: bytes, object_key: str, content_type: str, content_disposition: str | None = None) -> str: ...


def read_json(path: Path) -> object:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def git(source: Path, *args: str) -> str:
    # Windows 工作区在 WSL 挂载后仍按原来的换行规则检查，不修改仓库配置。
    options = ["-c", "core.autocrlf=true", "-c", "core.filemode=false"] if str(source).startswith("/mnt/") else []
    return subprocess.check_output(["git", *options, "-C", str(source), *args], text=True).strip()


def linux_path(value: str) -> Path:
    if re.match(r"^[A-Za-z]:/", value):
        return Path("/mnt") / value[0].lower() / value[3:]
    return Path(value)


def validate_zip(path: Path, template_id: str) -> None:
    prefix = template_id + "-template/"
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
        for required in ["package.json", "pnpm-lock.yaml", ".tpl/README.md", ".tpl/template.json", ".tpl/project.json"]:
            if prefix + required not in names:
                raise ValueError(f"{template_id}: ZIP 缺少 {required}")
        for entry in archive.infolist():
            parts = PurePosixPath(entry.filename).parts
            if not entry.filename.startswith(prefix) or ".." in parts or "\\" in entry.filename:
                raise ValueError("ZIP 路径不安全")
            if (entry.external_attr >> 16) & 0o170000 == 0o120000:
                raise ValueError("源码 ZIP 不允许符号链接")
            forbidden = {"node_modules", ".git", ".next", ".venv", "__pycache__", "logs", "dist", "coverage"}
            name = parts[-1]
            if forbidden.intersection(parts) or (name.startswith(".env") and name not in {".env.example", ".env.sample"}) or name.endswith((".pem", ".key", ".log", ".tsbuildinfo")):
                raise ValueError(f"ZIP 包含禁止发布文件: {entry.filename}")
        if archive.testzip() is not None:
            raise ValueError("ZIP CRC 校验失败")


def selected_ids(ids: list[str] | None) -> set[str]:
    available = {repo["id"] for repo in cast(Catalog, read_json(ROOT / "docs/template-repositories.json"))["repositories"]}
    if ids is None:
        return available
    selected = set(ids)
    if not selected or len(selected) != len(ids) or not selected.issubset(available):
        raise ValueError("增量发布模板 ID 为空、重复或未登记")
    return selected


def pack(output: Path, ids: list[str] | None = None) -> None:
    if sys.platform != "linux" or "microsoft" not in Path("/proc/sys/kernel/osrelease").read_text().lower() or str(output.resolve()).startswith("/mnt/"):
        raise ValueError("必须在本地 WSL Linux 文件系统中打包")
    selected = selected_ids(ids)
    records: dict[str, object] = {}
    output.mkdir(parents=True, exist_ok=True)
    repositories = cast(Catalog, read_json(ROOT / "docs/template-repositories.json"))["repositories"]
    for repo in repositories:
        template_id = repo["id"]
        if template_id not in selected:
            continue
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", template_id):
            raise ValueError("非法模板 ID")
        source = linux_path(repo["localPath"])
        if git(source, "status", "--porcelain"):
            raise ValueError(f"{template_id}: 工作区未提交，禁止发布")
        commit = git(source, "rev-parse", "HEAD")
        if commit != repo["commit"]:
            LOG.warning("源码与 Git 交付记录不同 id=%s recorded=%s actual=%s；ZIP 使用当前已提交源码", template_id, repo["commit"], commit)
        package = cast(dict[str, object], json.loads(git(source, "show", "HEAD:package.json")))
        version = cast(str, package["version"])
        if not re.fullmatch(r"\d+\.\d+\.\d+(?:-[\w.-]+)?", version):
            raise ValueError("非法版本")
        snapshot = ROOT / "website/templates" / f"{template_id}.lock.json"
        if snapshot.exists():
            lock = cast(dict[str, object], read_json(snapshot))
            if lock.get("sourceCommit") != commit or lock.get("sourceDirty") is not False:
                raise ValueError(f"{template_id}: 请先将当前干净提交同步为主站固定快照")
        archive = output / f"{template_id}-{version}-{commit}.zip"
        LOG.debug("开始打包 id=%s version=%s commit=%s output=%s", template_id, version, commit, archive)
        subprocess.run(["git", "-C", str(source), "archive", "--format=zip", f"--prefix={template_id}-template/", f"--output={archive}", commit], check=True)
        validate_zip(archive, template_id)
        records[template_id] = {"version": version, "sourceCommit": commit, "sha256": hashlib.sha256(archive.read_bytes()).hexdigest(), "size": archive.stat().st_size, "file": archive.name, "snapshotSha256": cast(dict[str, str], read_json(snapshot))["sha256"] if snapshot.exists() else None}
        LOG.info("打包通过 id=%s commit=%s bytes=%s", template_id, commit, archive.stat().st_size)
    write_json(output / "packages.json", records)


def publish(directory: Path, client: StorageClient | None = None, ids: list[str] | None = None) -> None:
    # 发布工具复用现有基础设施客户端，凭据只从服务端环境加载。
    if client is None:
        sys.path.insert(0, str(ROOT / "server/api/src"))
        from mz_ai_backend.shared.cos_storage import CosStorageClient, CosStorageSettings
        client = CosStorageClient(settings=CosStorageSettings.from_env())
    records = cast(dict[str, PackageRecord], read_json(directory / "packages.json"))
    expected = selected_ids(ids)
    if set(records) != expected:
        raise ValueError("打包清单与当前独立模板目录不一致，请重新打包")
    # 增量发布保留历史条目；只对本批对象上传、下载及验收，全部通过后一次切换。
    manifest = ROOT / "website/templates/releases.json"
    released = cast(dict[str, object], read_json(manifest)) if ids is not None and manifest.exists() else {}
    for template_id, record in records.items():
        if Path(record["file"]).name != record["file"]:
            raise ValueError("非法 ZIP 文件名")
        snapshot = ROOT / "website/templates" / f"{template_id}.lock.json"
        if snapshot.exists():
            lock = cast(dict[str, object], read_json(snapshot))
            if lock.get("sha256") != record["snapshotSha256"] or lock.get("sourceCommit") != record["sourceCommit"] or lock.get("sourceDirty") is not False:
                raise ValueError(f"{template_id}: 打包后生产快照发生改变，请重新打包")
        archive = directory / record["file"]
        validate_zip(archive, template_id)
        content = archive.read_bytes()
        if hashlib.sha256(content).hexdigest() != record["sha256"] or len(content) != record["size"]:
            raise ValueError(f"{template_id}: 上传前摘要不匹配")
        key = f"website/template-packages/{template_id}/{record['version']}-{record['sourceCommit']}/{record['sha256']}.zip"
        LOG.debug("开始上传 id=%s key=%s bytes=%s sha256=%s", template_id, key, len(content), record["sha256"])
        url = client.upload_bytes(content=content, object_key=key, content_type="application/zip", content_disposition=f'attachment; filename="{archive.name}"')
        # 公开 GET 必须校验真实字节；不能仅以 SDK 上传成功作为发布成功。
        LOG.debug("开始匿名下载校验 id=%s url=%s", template_id, url)
        with urllib.request.urlopen(url, timeout=180) as response:
            downloaded = response.read()
        if hashlib.sha256(downloaded).hexdigest() != record["sha256"]:
            raise ValueError(f"{template_id}: 公开下载摘要不匹配")
        with tempfile.TemporaryDirectory() as temporary:
            downloaded_zip = Path(temporary) / "download.zip"
            downloaded_zip.write_bytes(downloaded)
            validate_zip(downloaded_zip, template_id)
        released[template_id] = {**record, "url": url}
        LOG.info("公开下载验证通过 id=%s sha256=%s", template_id, record["sha256"])
    # 全部通过才原子切换清单，失败重试复用内容寻址对象，不覆盖上一版本。
    write_json(ROOT / "website/templates/releases.json", released)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["pack", "publish"])
    parser.add_argument("directory", type=Path)
    parser.add_argument("--ids", help="仅发布指定模板，逗号分隔；保留其他发布记录")
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    LOG.setLevel(logging.DEBUG)
    # SDK 的 DEBUG 日志可能包含签名请求，发布日志只记录模板、版本及摘要。
    logging.getLogger("qcloud_cos").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    if args.command == "pack":
        pack(args.directory, args.ids.split(",") if args.ids is not None else None)
    else:
        publish(args.directory, ids=args.ids.split(",") if args.ids is not None else None)


if __name__ == "__main__":
    main()
