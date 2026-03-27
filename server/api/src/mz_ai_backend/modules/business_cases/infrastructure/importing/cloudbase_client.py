from __future__ import annotations

import json
import mimetypes
import urllib.error
import urllib.request
from pathlib import Path

from .models import CaseImportCloudBaseSettings, CloudBaseUploadTicket


class CloudBaseStorageClient:
    """Upload local assets through the CloudBase HTTP API."""

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


def _build_upload_info_url(env_id: str) -> str:
    normalized_env_id = env_id.strip()
    if normalized_env_id == "":
        raise ValueError("env_id must not be blank.")
    return (
        f"https://{normalized_env_id}.api.tcloudbasegateway.com"
        "/v1/storages/get-objects-upload-info"
    )


def _normalize_object_key(object_key: str) -> str:
    normalized_object_key = object_key.strip().lstrip("/")
    if normalized_object_key == "":
        raise ValueError("object_key must not be blank.")
    return normalized_object_key
