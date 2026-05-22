"""博主洞察报告 publish 时把 frame 图上传到腾讯云 COS。

为什么不复用 server/api/.../cos_storage.py 而是单独写一份：
  · research-kit 是独立可分发的 CLI，要求依赖最小化、可独立 ``uv run`` 启动；
    复用 server 模块会引入 sqlalchemy / fastapi 等无关重依赖。
  · server 那份 cos_storage 还要支持 list / delete / 目录扫描；publish 阶段
    只需要 upload，所以这里只暴露 ``upload_file``。
  · 环境变量名故意复用 server 那边的 ``MZ_AI_CASE_IMPORT_COS_*``——这是
    Weelume 全栈通用的腾讯云 COS 凭证，跨项目共享一份，避免凭证分裂。
"""

from __future__ import annotations

import logging
import mimetypes
import os
import re
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import quote

from qcloud_cos import CosConfig, CosS3Client
from qcloud_cos.cos_exception import CosClientError, CosServiceError

_LOGGER = logging.getLogger(__name__)

# 环境变量名沿用 server 端，凭证全栈共享。
ENV_APP_ID = "MZ_AI_CASE_IMPORT_COS_APP_ID"
ENV_REGION = "MZ_AI_CASE_IMPORT_COS_REGION"
ENV_SECRET_ID = "MZ_AI_CASE_IMPORT_COS_SECRET_ID"
ENV_SECRET_KEY = "MZ_AI_CASE_IMPORT_COS_SECRET_KEY"
ENV_SESSION_TOKEN = "MZ_AI_CASE_IMPORT_COS_SESSION_TOKEN"
ENV_BUCKET_NAME = "MZ_AI_CASE_IMPORT_COS_BUCKET_NAME"

DEFAULT_BUCKET_NAME = "weelume-pro"


class CosUploadError(RuntimeError):
    """COS 上传链路里的显式错误。"""


@dataclass(frozen=True)
class CosCredentials:
    """从环境变量加载的腾讯云 COS 凭证 + bucket 配置。"""

    app_id: str
    region: str
    secret_id: str
    secret_key: str
    bucket_name: str
    session_token: str | None = None

    @property
    def normalized_app_id(self) -> str:
        if self.app_id.isdecimal():
            return self.app_id
        match = re.search(r"-(\d+)$", self.app_id)
        if match is None:
            return self.app_id
        return match.group(1)

    @property
    def bucket(self) -> str:
        normalized = self.normalized_app_id
        if self.bucket_name.endswith(f"-{normalized}"):
            return self.bucket_name
        return f"{self.bucket_name}-{normalized}"

    @property
    def host(self) -> str:
        return f"{self.bucket}.cos.{self.region}.myqcloud.com"

    @property
    def endpoint(self) -> str:
        return f"https://{self.host}"


def _require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if value == "":
        raise CosUploadError(
            f"缺少 COS 环境变量 {name}；请在 server 端 .env 或当前 shell 中设置。"
        )
    return value


def load_cos_credentials() -> CosCredentials:
    """从进程环境变量加载凭证。缺哪个都直接报错，禁止静默兜底。"""

    return CosCredentials(
        app_id=_require_env(ENV_APP_ID),
        region=_require_env(ENV_REGION),
        secret_id=_require_env(ENV_SECRET_ID),
        secret_key=_require_env(ENV_SECRET_KEY),
        session_token=(os.environ.get(ENV_SESSION_TOKEN) or "").strip() or None,
        bucket_name=(os.environ.get(ENV_BUCKET_NAME) or DEFAULT_BUCKET_NAME).strip(),
    )


class CosFrameUploader:
    """上传本地图片到腾讯云 COS，返回公开 HTTPS URL。

    实现说明：
      · 同一 object_key 重复上传等价于覆盖；publish 的对象命名带 run_id，
        新一次拆解写新的 key，不会冲撞旧 run。
      · 不做 ContentDisposition 覆盖——图片资源默认就是 inline 行为。
    """

    def __init__(
        self,
        *,
        credentials: CosCredentials | None = None,
        sdk_client: CosS3Client | None = None,
    ) -> None:
        self._credentials = credentials or load_cos_credentials()
        self._client = sdk_client or CosS3Client(
            CosConfig(
                Region=self._credentials.region,
                SecretId=self._credentials.secret_id,
                SecretKey=self._credentials.secret_key,
                Token=self._credentials.session_token,
                Scheme="https",
            )
        )

    def upload_file(self, *, local_path: Path, object_key: str) -> str:
        normalized_key = _normalize_object_key(object_key)
        content_type = mimetypes.guess_type(local_path.name)[0] or "application/octet-stream"
        try:
            self._client.put_object(
                Bucket=self._credentials.bucket,
                Body=local_path.read_bytes(),
                Key=normalized_key,
                ContentType=content_type,
            )
        except (CosClientError, CosServiceError) as exc:
            raise CosUploadError(
                f"上传 COS 失败 object_key={normalized_key}：{_format_sdk_error(exc)}"
            ) from exc
        url = f"{self._credentials.endpoint}/{quote(normalized_key, safe='/-_.~')}"
        _LOGGER.debug("cos upload ok key=%s url=%s", normalized_key, url)
        return url


def _normalize_object_key(object_key: str) -> str:
    normalized = object_key.strip().lstrip("/")
    if normalized == "":
        raise CosUploadError("object_key 不能为空")
    return normalized


def _format_sdk_error(exc: CosClientError | CosServiceError) -> str:
    if isinstance(exc, CosServiceError):
        return (
            f"HTTP {exc.get_status_code()} code={exc.get_error_code()} "
            f"message={exc.get_error_msg()} request_id={exc.get_request_id()}"
        )
    return str(exc)


__all__ = [
    "CosCredentials",
    "CosFrameUploader",
    "CosUploadError",
    "DEFAULT_BUCKET_NAME",
    "ENV_APP_ID",
    "ENV_BUCKET_NAME",
    "ENV_REGION",
    "ENV_SECRET_ID",
    "ENV_SECRET_KEY",
    "ENV_SESSION_TOKEN",
    "load_cos_credentials",
]
