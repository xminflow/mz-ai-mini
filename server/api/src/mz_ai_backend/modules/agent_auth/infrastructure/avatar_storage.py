from __future__ import annotations

import hashlib
import logging

from fastapi.concurrency import run_in_threadpool

from mz_ai_backend.shared import CosStorageClient

logger = logging.getLogger(__name__)


class CosAgentAvatarStorage:
    def __init__(self, *, client: CosStorageClient) -> None:
        self._client = client

    async def upload(self, *, account_id: int, content: bytes, content_type: str) -> str:
        extension = {"image/png": "png", "image/jpeg": "jpg", "image/webp": "webp"}[content_type]
        # 账号目录与内容摘要由服务端生成；重试复用对象，不允许客户端指定路径覆盖他人头像。
        digest = hashlib.sha256(content).hexdigest()
        object_key = f"website/avatars/{account_id}/{digest}.{extension}"
        try:
            return await run_in_threadpool(
                self._client.upload_bytes, content=content, object_key=object_key, content_type=content_type,
            )
        except Exception:
            logger.exception("头像存储失败：account_id=%s", account_id)
            raise
