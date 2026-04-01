from __future__ import annotations

from collections.abc import Iterable
import json
import mimetypes
import shutil
import subprocess
import urllib.error
import urllib.request
from pathlib import Path

from .models import CaseImportCloudBaseSettings, CloudBaseUploadTicket


class CloudBaseStorageClient:
    """Upload local assets through the CloudBase HTTP API."""

    _MAX_DELETE_BATCH_SIZE = 50

    def __init__(
        self,
        *,
        settings: CaseImportCloudBaseSettings,
        timeout_seconds: int = 30,
    ) -> None:
        self._settings = settings
        self._timeout_seconds = timeout_seconds

    def upload_file(
        self,
        *,
        local_path: Path,
        object_key: str,
    ) -> str:
        """Upload one local file and return the CloudBase file ID."""

        normalized_object_key = _normalize_object_key(object_key)
        upload_ticket = self._request_upload_ticket(object_id=normalized_object_key)
        self._upload_binary(local_path=local_path, upload_ticket=upload_ticket)
        return upload_ticket.cloud_object_id

    def delete_files(self, *, cloud_object_ids: Iterable[str]) -> None:
        """Delete uploaded CloudBase objects by their cloud object ids."""

        normalized_ids = tuple(
            _normalize_cloud_object_id(cloud_object_id) for cloud_object_id in cloud_object_ids
        )
        if not normalized_ids:
            return

        for batch_start in range(0, len(normalized_ids), self._MAX_DELETE_BATCH_SIZE):
            batch = normalized_ids[
                batch_start : batch_start + self._MAX_DELETE_BATCH_SIZE
            ]
            self._delete_file_batch(batch)

    def delete_directory(self, *, cloud_directory: str) -> None:
        """Delete one CloudBase directory recursively through the official CLI."""

        normalized_directory = _normalize_cloud_directory(cloud_directory)
        delete_result = self._run_tcb_command(
            "storage",
            "delete",
            normalized_directory,
            "--dir",
            "-e",
            self._settings.env_id,
        )
        if delete_result.returncode == 0:
            return

        combined_output = _combine_process_output(delete_result)
        if self._is_missing_identity_error(combined_output):
            self._login_tcb_cli_if_possible()
            retry_result = self._run_tcb_command(
                "storage",
                "delete",
                normalized_directory,
                "--dir",
                "-e",
                self._settings.env_id,
            )
            if retry_result.returncode == 0:
                return
            raise RuntimeError(
                "Failed to delete CloudBase directory "
                f"'{normalized_directory}': {_combine_process_output(retry_result)}"
            )

        raise RuntimeError(
            "Failed to delete CloudBase directory "
            f"'{normalized_directory}': {combined_output}"
        )

    def _request_upload_ticket(self, *, object_id: str) -> CloudBaseUploadTicket:
        request = urllib.request.Request(
            url=_build_upload_info_url(self._settings.env_id),
            method="POST",
            data=json.dumps([{"objectId": object_id}], ensure_ascii=False).encode(
                "utf-8"
            ),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self._settings.api_key}",
            },
        )

        try:
            with urllib.request.urlopen(
                request,
                timeout=self._timeout_seconds,
            ) as response:
                response_status = response.getcode()
                response_payload = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            raise RuntimeError(
                "Failed to request CloudBase upload information: "
                f"HTTP {exc.code}."
            ) from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(
                "Failed to request CloudBase upload information: "
                f"{exc.reason}."
            ) from exc

        if response_status != 200:
            raise RuntimeError(
                "Failed to request CloudBase upload information: "
                f"HTTP {response_status}."
            )
        if not isinstance(response_payload, list) or not response_payload:
            raise RuntimeError("CloudBase did not return any upload information.")

        first_item = response_payload[0]
        if not isinstance(first_item, dict):
            raise RuntimeError("CloudBase upload information is invalid.")

        error_code = first_item.get("code")
        if isinstance(error_code, str) and error_code.strip() != "":
            error_message = str(first_item.get("message", "")).strip()
            raise RuntimeError(
                "Failed to request CloudBase upload information for "
                f"'{object_id}': {error_code} {error_message}".rstrip()
            )

        return CloudBaseUploadTicket.model_validate(first_item)

    def _upload_binary(
        self,
        *,
        local_path: Path,
        upload_ticket: CloudBaseUploadTicket,
    ) -> None:
        content_type = (
            mimetypes.guess_type(local_path.name)[0] or "application/octet-stream"
        )
        request = urllib.request.Request(
            url=upload_ticket.upload_url,
            method="PUT",
            data=local_path.read_bytes(),
            headers={
                "Authorization": upload_ticket.authorization,
                "X-Cos-Security-Token": upload_ticket.token,
                "X-Cos-Meta-Fileid": upload_ticket.cloud_object_meta,
                "Content-Type": content_type,
            },
        )

        try:
            with urllib.request.urlopen(
                request,
                timeout=self._timeout_seconds,
            ) as response:
                status_code = response.getcode()
        except urllib.error.HTTPError as exc:
            raise RuntimeError(
                f"Failed to upload '{local_path}' to CloudBase: HTTP {exc.code}."
            ) from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(
                f"Failed to upload '{local_path}' to CloudBase: {exc.reason}."
            ) from exc

        if status_code not in (200, 201, 204):
            raise RuntimeError(
                f"Failed to upload '{local_path}' to CloudBase: HTTP {status_code}."
            )

    def _delete_file_batch(self, cloud_object_ids: tuple[str, ...]) -> None:
        request = urllib.request.Request(
            url=_build_delete_objects_url(self._settings.env_id),
            method="POST",
            data=json.dumps(
                [{"cloudObjectId": cloud_object_id} for cloud_object_id in cloud_object_ids],
                ensure_ascii=False,
            ).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self._settings.api_key}",
            },
        )

        try:
            with urllib.request.urlopen(
                request,
                timeout=self._timeout_seconds,
            ) as response:
                response_status = response.getcode()
                response_payload = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            raise RuntimeError(
                f"Failed to delete CloudBase objects: HTTP {exc.code}."
            ) from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(
                f"Failed to delete CloudBase objects: {exc.reason}."
            ) from exc

        if response_status != 200:
            raise RuntimeError(f"Failed to delete CloudBase objects: HTTP {response_status}.")
        if not isinstance(response_payload, list):
            raise RuntimeError("CloudBase delete response is invalid.")

        for item in response_payload:
            if not isinstance(item, dict):
                raise RuntimeError("CloudBase delete response is invalid.")
            error_code = str(item.get("code", "")).strip()
            if error_code in {"", "OBJECT_NOT_EXIST"}:
                continue

            error_message = str(item.get("message", "")).strip()
            raise RuntimeError(
                "Failed to delete CloudBase object "
                f"'{item.get('cloudObjectId', '')}': {error_code} {error_message}".rstrip()
            )

    def _login_tcb_cli_if_possible(self) -> None:
        if not self._settings.has_cli_credentials:
            raise RuntimeError(
                "CloudBase CLI is not authenticated. Run 'tcb login' first, or set "
                "MZ_AI_CASE_IMPORT_CLOUDBASE_CLI_API_KEY_ID and "
                "MZ_AI_CASE_IMPORT_CLOUDBASE_CLI_API_KEY."
            )

        login_command = [
            "tcb",
            "login",
            "--apiKeyId",
            self._settings.cli_api_key_id,
            "--apiKey",
            self._settings.cli_api_key,
        ]
        if self._settings.cli_token is not None:
            login_command.extend(["--token", self._settings.cli_token])

        login_result = self._run_tcb_command(*login_command[1:])
        if login_result.returncode != 0:
            raise RuntimeError(
                f"Failed to authenticate CloudBase CLI: {_combine_process_output(login_result)}"
            )

    def _run_tcb_command(self, *args: str) -> subprocess.CompletedProcess[str]:
        tcb_executable = shutil.which("tcb") or shutil.which("tcb.cmd")
        if tcb_executable is None:
            raise RuntimeError(
                "CloudBase CLI 'tcb' is not installed. Install @cloudbase/cli first."
            )

        return subprocess.run(
            [tcb_executable, *args],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False,
        )

    def _is_missing_identity_error(self, output: str) -> bool:
        normalized_output = output.lower()
        return "no valid identity information" in normalized_output


def _build_upload_info_url(env_id: str) -> str:
    normalized_env_id = env_id.strip()
    if normalized_env_id == "":
        raise ValueError("env_id must not be blank.")
    return (
        f"https://{normalized_env_id}.api.tcloudbasegateway.com"
        "/v1/storages/get-objects-upload-info"
    )


def _build_delete_objects_url(env_id: str) -> str:
    normalized_env_id = env_id.strip()
    if normalized_env_id == "":
        raise ValueError("env_id must not be blank.")
    return (
        f"https://{normalized_env_id}.api.tcloudbasegateway.com"
        "/v1/storages/delete-objects"
    )


def _normalize_object_key(object_key: str) -> str:
    normalized_object_key = object_key.strip().lstrip("/")
    if normalized_object_key == "":
        raise ValueError("object_key must not be blank.")
    return normalized_object_key


def _normalize_cloud_object_id(cloud_object_id: str) -> str:
    normalized_cloud_object_id = cloud_object_id.strip()
    if normalized_cloud_object_id == "":
        raise ValueError("cloud_object_id must not be blank.")
    if not normalized_cloud_object_id.startswith("cloud://"):
        raise ValueError("cloud_object_id must start with cloud://.")
    return normalized_cloud_object_id


def _normalize_cloud_directory(cloud_directory: str) -> str:
    normalized_cloud_directory = cloud_directory.strip().strip("/")
    if normalized_cloud_directory == "":
        raise ValueError("cloud_directory must not be blank.")
    return normalized_cloud_directory


def _combine_process_output(result: subprocess.CompletedProcess[str]) -> str:
    combined_output = "\n".join(
        part.strip() for part in (result.stdout, result.stderr) if part.strip()
    ).strip()
    if combined_output != "":
        return combined_output
    return f"command exited with code {result.returncode}"
