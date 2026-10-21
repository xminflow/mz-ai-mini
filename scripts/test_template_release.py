from __future__ import annotations

from pathlib import Path
import hashlib
import io
import json
import tempfile
import unittest
import zipfile
from unittest.mock import patch

import template_release
from template_release import publish, validate_zip


class FakeStorage:
    def __init__(self) -> None:
        self.objects: dict[str, bytes] = {}

    def upload_bytes(self, *, content: bytes, object_key: str, content_type: str, content_disposition: str | None = None) -> str:
        url = "https://example.com/" + object_key
        self.objects[url] = content
        return url


class ZipSafetyTests(unittest.TestCase):
    def make_archive(self, path: Path, extra: str | None = None) -> None:
        with zipfile.ZipFile(path, "w") as archive:
            for name in ["package.json", "pnpm-lock.yaml", ".tpl/README.md", ".tpl/template.json", ".tpl/project.json"]:
                archive.writestr("demo-template/" + name, "{}")
            if extra:
                archive.writestr(extra, "secret")

    def test_complete_source_is_accepted(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "source.zip"
            self.make_archive(path)
            validate_zip(path, "demo")

    def test_unsafe_or_private_files_are_rejected(self) -> None:
        for name in ["demo-template/../escape", "demo-template/.env", "demo-template/node_modules/lib/index.js", "demo-template/private.key", "demo-template/server.log"]:
            with self.subTest(name=name), tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / "source.zip"
                self.make_archive(path, name)
                with self.assertRaises(ValueError):
                    validate_zip(path, "demo")

    def test_incomplete_runtime_package_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "source.zip"
            with zipfile.ZipFile(path, "w") as archive:
                archive.writestr("demo-template/package.json", "{}")
            with self.assertRaisesRegex(ValueError, "ZIP 缺少"):
                validate_zip(path, "demo")

    def test_download_failure_preserves_manifest_and_retry_succeeds(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "docs").mkdir()
            (root / "website/templates").mkdir(parents=True)
            manifest = root / "website/templates/releases.json"
            manifest.write_text('{"previous": true}', encoding="utf-8")
            records: dict[str, object] = {}
            for template_id in ["demo", "other"]:
                archive = root / f"{template_id}.zip"
                self.make_archive(archive)
                if template_id == "other":
                    with zipfile.ZipFile(archive, "w") as output:
                        for name in ["package.json", "pnpm-lock.yaml", ".tpl/README.md", ".tpl/template.json", ".tpl/project.json"]:
                            output.writestr("other-template/" + name, "{}")
                content = archive.read_bytes()
                records[template_id] = {"file": archive.name, "size": len(content), "sha256": hashlib.sha256(content).hexdigest(), "version": "1.0.0", "sourceCommit": "a" * 40, "snapshotSha256": None}
            (root / "packages.json").write_text(json.dumps(records), encoding="utf-8")
            (root / "docs/template-repositories.json").write_text(json.dumps({"repositories": [{"id": "demo"}, {"id": "other"}]}), encoding="utf-8")
            storage = FakeStorage()

            def get_object(url: str, timeout: int = 180) -> io.BytesIO:
                return io.BytesIO(storage.objects[url])

            with patch.object(template_release, "ROOT", root):
                with patch.object(template_release.urllib.request, "urlopen", return_value=io.BytesIO(b"corrupt")):
                    with self.assertRaisesRegex(ValueError, "公开下载摘要不匹配"):
                        publish(root, storage)
                self.assertEqual(json.loads(manifest.read_text(encoding="utf-8")), {"previous": True})
                with patch.object(template_release.urllib.request, "urlopen", side_effect=get_object):
                    publish(root, storage)
                self.assertEqual(set(json.loads(manifest.read_text(encoding="utf-8"))), {"demo", "other"})

    def test_incremental_release_preserves_previous_and_downloads_only_selected(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "docs").mkdir()
            (root / "website/templates").mkdir(parents=True)
            manifest = root / "website/templates/releases.json"
            previous = {"other": {"url": "https://example.com/unchanged.zip", "sha256": "old"}}
            manifest.write_text(json.dumps(previous), encoding="utf-8")
            archive = root / "demo.zip"
            self.make_archive(archive)
            content = archive.read_bytes()
            record = {"file": archive.name, "size": len(content), "sha256": hashlib.sha256(content).hexdigest(), "version": "1.0.0", "sourceCommit": "a" * 40, "snapshotSha256": None}
            (root / "packages.json").write_text(json.dumps({"demo": record}), encoding="utf-8")
            (root / "docs/template-repositories.json").write_text(json.dumps({"repositories": [{"id": "demo"}, {"id": "other"}]}), encoding="utf-8")
            storage = FakeStorage()
            with patch.object(template_release, "ROOT", root):
                for ids in [["unknown"], ["demo", "demo"], []]:
                    with self.assertRaises(ValueError):
                        template_release.selected_ids(ids)
                with self.assertRaisesRegex(ValueError, "打包清单"):
                    publish(root, storage, ids=["other"])
                with patch.object(template_release.urllib.request, "urlopen", return_value=io.BytesIO(b"corrupt")):
                    with self.assertRaisesRegex(ValueError, "公开下载摘要不匹配"):
                        publish(root, storage, ids=["demo"])
                self.assertEqual(json.loads(manifest.read_text(encoding="utf-8")), previous)
                def download_selected(url: str, timeout: int = 180) -> io.BytesIO:
                    return io.BytesIO(storage.objects[url])

                with patch.object(template_release.urllib.request, "urlopen", side_effect=download_selected) as download:
                    publish(root, storage, ids=["demo"])
                self.assertEqual(download.call_count, 1)
                self.assertEqual(len(storage.objects), 1)
                self.assertEqual(json.loads(manifest.read_text(encoding="utf-8"))["other"], previous["other"])


if __name__ == "__main__":
    unittest.main()
