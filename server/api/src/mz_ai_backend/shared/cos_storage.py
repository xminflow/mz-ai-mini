from __future__ import annotations

from collections.abc import Iterable
import mimetypes
from pathlib import Path
import re

from pydantic import Field, ValidationError, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from qcloud_cos import CosConfig, CosS3Client
from qcloud_cos.cos_exception import CosClientError, CosServiceError

SERVER_ENV_FILE = Path(__file__).resolve().parents[4] / ".env"


def _strip_required_text(value: str, *, field_name: str) -> str:
    normalized = value.strip()
    if normalized == "":
        raise ValueError(f"{field_name} must not be blank.")
    return normalized


def _strip_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip()
    if normalized == "":
        return None
    return normalized


def _normalize_app_id(value: str) -> str:
    normalized = _strip_required_text(value, field_name="app_id")
    if normalized.isdecimal():
        return normalized

    match = re.search(r"-(\d+)$", normalized)
    if match is None:
        return normalized
    return match.group(1)


class CosStorageSettings(BaseSettings):
    """Tencent Cloud COS settings used by backend object storage clients."""

    model_config = SettingsConfigDict(
        env_file=SERVER_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
        frozen=True,
        populate_by_name=True,
    )

    app_id: str = Field(validation_alias="MZ_AI_CASE_IMPORT_COS_APP_ID")
    region: str = Field(validation_alias="MZ_AI_CASE_IMPORT_COS_REGION")
    secret_id: str = Field(validation_alias="MZ_AI_CASE_IMPORT_COS_SECRET_ID")
    secret_key: str = Field(validation_alias="MZ_AI_CASE_IMPORT_COS_SECRET_KEY")
    session_token: str | None = Field(
        default=None,
        validation_alias="MZ_AI_CASE_IMPORT_COS_SESSION_TOKEN",
    )
    bucket_name: str = Field(
        default="weelume-pro",
        validation_alias="MZ_AI_CASE_IMPORT_COS_BUCKET_NAME",
    )

    @field_validator("app_id", "region", "secret_id", "secret_key", "bucket_name")
    @classmethod
    def validate_required_fields(cls, value: str, info) -> str:
        return _strip_required_text(value, field_name=info.field_name)

    @field_validator("session_token")
    @classmethod
    def validate_session_token(cls, value: str | None) -> str | None:
        return _strip_optional_text(value)

    @classmethod
    def from_env(cls) -> "CosStorageSettings":
        """Build Tencent Cloud COS settings from the process environment."""

        try:
            return cls()
        except ValidationError as exc:
            missing_key_by_field = {
                ("app_id",): "MZ_AI_CASE_IMPORT_COS_APP_ID",
                ("region",): "MZ_AI_CASE_IMPORT_COS_REGION",
                ("secret_id",): "MZ_AI_CASE_IMPORT_COS_SECRET_ID",
                ("secret_key",): "MZ_AI_CASE_IMPORT_COS_SECRET_KEY",
            }
            missing_keys = tuple(
                missing_key_by_field[error["loc"]]
                for error in exc.errors()
                if error["type"] == "missing" and error["loc"] in missing_key_by_field
            )
            if not missing_keys:
                raise

            joined_keys = ", ".join(missing_keys)
            raise ValueError(
                f"Missing COS environment variables: {joined_keys}."
            ) from exc

    @property
    def bucket(self) -> str:
        if self.bucket_name.endswith(f"-{self.normalized_app_id}"):
            return self.bucket_name
        return f"{self.bucket_name}-{self.normalized_app_id}"

    @property
    def normalized_app_id(self) -> str:
        return _normalize_app_id(self.app_id)

    @property
    def host(self) -> str:
        return f"{self.bucket}.cos.{self.region}.myqcloud.com"

    @property
    def endpoint(self) -> str:
        return f"https://{self.host}"


class CosStorageClient:
    """Upload and delete local assets through Tencent Cloud COS SDK."""

    def __init__(
        self,
        *,
        settings: CosStorageSettings,
        sdk_client: CosS3Client | None = None,
    ) -> None:
        self._settings = settings
        self._client = sdk_client or CosS3Client(
            CosConfig(
                Region=settings.region,
                SecretId=settings.secret_id,
                SecretKey=settings.secret_key,
                Token=settings.session_token,
                Scheme="https",
            )
        )

    def upload_file(
        self,
        *,
        local_path: Path,
        object_key: str,
    ) -> str:
        """Upload one local file and return its public HTTPS object URL."""

        normalized_object_key = _normalize_object_key(object_key)
        return self.upload_bytes(
            content=local_path.read_bytes(),
            object_key=normalized_object_key,
            content_type=_guess_content_type(local_path.name),
        )

    def upload_bytes(
        self,
        *,
        content: bytes,
        object_key: str,
        content_type: str,
    ) -> str:
        """Upload one binary payload and return its public HTTPS object URL."""

        normalized_object_key = _normalize_object_key(object_key)
        normalized_content_type = _normalize_content_type(content_type)
        try:
            self._client.put_object(
                Bucket=self._settings.bucket,
                Body=content,
                Key=normalized_object_key,
                ContentType=normalized_content_type,
            )
        except (CosClientError, CosServiceError) as exc:
            raise RuntimeError(
                f"Failed to upload COS object '{normalized_object_key}': "
                f"{_format_sdk_error(exc)}."
            ) from exc

        return _build_object_url(settings=self._settings, object_key=normalized_object_key)

    def delete_files(self, *, object_urls: Iterable[str]) -> None:
        """Delete uploaded COS objects by object URL or object key."""

        for object_url in object_urls:
            self._delete_object(object_key=_normalize_object_reference(object_url))

    def delete_directory(self, *, cloud_directory: str) -> None:
        """Delete every COS object under one directory prefix."""

        normalized_directory = _normalize_directory_prefix(cloud_directory)
        for object_key in self._list_object_keys(prefix=normalized_directory):
            self._delete_object(object_key=object_key)

    def _delete_object(self, *, object_key: str) -> None:
        try:
            self._client.delete_object(
                Bucket=self._settings.bucket,
                Key=object_key,
            )
        except CosServiceError as exc:
            if exc.get_status_code() == 404:
                return
            raise RuntimeError(
                f"Failed to delete COS object '{object_key}': {_format_sdk_error(exc)}."
            ) from exc
        except CosClientError as exc:
            raise RuntimeError(
                f"Failed to delete COS object '{object_key}': {_format_sdk_error(exc)}."
            ) from exc

    def _list_object_keys(self, *, prefix: str) -> tuple[str, ...]:
        object_keys: list[str] = []
        continuation_token: str | None = None

        while True:
            request: dict[str, str] = {
                "Bucket": self._settings.bucket,
                "Prefix": prefix,
                "MaxKeys": "1000",
            }
            if continuation_token is not None:
                request["ContinuationToken"] = continuation_token

            try:
                response = self._client.list_objects(**request)
            except (CosClientError, CosServiceError) as exc:
                raise RuntimeError(
                    f"Failed to list COS directory '{prefix}': {_format_sdk_error(exc)}."
                ) from exc

            contents = response.get("Contents") or []
            object_keys.extend(
                item["Key"]
                for item in contents
                if isinstance(item, dict)
                and isinstance(item.get("Key"), str)
                and item["Key"].strip() != ""
            )
            if not _is_truncated(response):
                return tuple(object_keys)

            continuation_token = response.get("NextContinuationToken")
            if not isinstance(continuation_token, str) or continuation_token == "":
                raise RuntimeError(
                    "COS list directory response is missing continuation token."
                )


def _is_truncated(response: dict[str, object]) -> bool:
    value = response.get("IsTruncated")
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() == "true"
    return False


def _build_object_url(*, settings: CosStorageSettings, object_key: str) -> str:
    return f"{settings.endpoint}/{_quote_object_key(object_key)}"


def _format_sdk_error(exc: CosClientError | CosServiceError) -> str:
    if isinstance(exc, CosServiceError):
        code = exc.get_error_code()
        message = exc.get_error_msg()
        request_id = exc.get_request_id()
        status_code = exc.get_status_code()
        return (
            f"HTTP {status_code}, code={code}, message={message}, "
            f"request_id={request_id}"
        )
    return str(exc)


def _guess_content_type(file_name: str) -> str:
    return mimetypes.guess_type(file_name)[0] or "application/octet-stream"


def _normalize_content_type(content_type: str) -> str:
    normalized_content_type = content_type.strip()
    if normalized_content_type == "":
        raise ValueError("content_type must not be blank.")
    return normalized_content_type


def _normalize_object_key(object_key: str) -> str:
    normalized_object_key = object_key.strip().lstrip("/")
    if normalized_object_key == "":
        raise ValueError("object_key must not be blank.")
    return normalized_object_key


def _normalize_directory_prefix(cloud_directory: str) -> str:
    normalized_directory = _normalize_object_key(cloud_directory).rstrip("/")
    return f"{normalized_directory}/"


def _normalize_object_reference(object_reference: str) -> str:
    normalized_reference = object_reference.strip()
    if normalized_reference == "":
        raise ValueError("object_reference must not be blank.")
    endpoint_prefix = "/".join(_split_endpoint(normalized_reference)[:3])
    if endpoint_prefix == "":
        return _normalize_object_key(normalized_reference)
    return _normalize_object_key(normalized_reference.removeprefix(endpoint_prefix))


def _split_endpoint(value: str) -> tuple[str, ...]:
    if not value.startswith(("http://", "https://")):
        return ()
    parts = value.split("/")
    if len(parts) < 3:
        return ()
    return tuple(parts[:3])


def _quote_object_key(value: str) -> str:
    from urllib.parse import quote

    return quote(value, safe="/-_.~")
