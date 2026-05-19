"""LLM 客户端抽象。

抽象出 `LLMClient` Protocol，便于未来切换 Claude CLI / Anthropic SDK / 其它实现。
首版只提供 `AnthropicClient`（基于官方 SDK + prompt caching）。
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Protocol

from research_kit.core.logging import get_logger
from research_kit.core.settings import Settings
from research_kit.core.skills import SkillManifest

_log = get_logger(__name__)


# ===================== Protocol =====================


@dataclass(frozen=True, slots=True)
class LLMRunResult:
    """LLM 一次调用的结果摘要。"""

    text: str
    input_tokens: int
    output_tokens: int
    cache_read_input_tokens: int = 0
    cache_creation_input_tokens: int = 0


class LLMClient(Protocol):
    """LLM 调用统一接口。"""

    def run_with_skill(
        self,
        skill: SkillManifest,
        user_payload: dict[str, object],
        on_text: Callable[[str], None] | None = None,
        log_path: Path | None = None,
    ) -> LLMRunResult: ...


# ===================== Anthropic 实现 =====================


class AnthropicClient:
    """基于 Anthropic Python SDK 的 LLM 客户端。

    把 skill 正文放进 system 块（开启 prompt caching），把 user_payload 序列化为
    JSON 放进 user 消息。流式接收输出，每片可选地通过 on_text 回调上报，并把
    完整事件流写入 log_path（JSONL）。
    """

    def __init__(self, settings: Settings) -> None:
        if not settings.anthropic_api_key:
            raise ValueError(
                "未设置 ANTHROPIC_API_KEY。请通过环境变量或 settings 注入。"
            )
        # 延迟 import，避免 anthropic 未安装时影响 core 模块导入。
        from anthropic import Anthropic

        kwargs: dict[str, object] = {"api_key": settings.anthropic_api_key}
        if settings.anthropic_base_url:
            kwargs["base_url"] = settings.anthropic_base_url
        self._client = Anthropic(**kwargs)  # type: ignore[arg-type]
        self._model = settings.anthropic_model
        self._max_tokens = 16384

    def run_with_skill(
        self,
        skill: SkillManifest,
        user_payload: dict[str, object],
        on_text: Callable[[str], None] | None = None,
        log_path: Path | None = None,
    ) -> LLMRunResult:
        system_blocks = [
            {
                "type": "text",
                "text": skill.body,
                "cache_control": {"type": "ephemeral"},
            }
        ]
        user_message = self._format_user_payload(skill.name, user_payload)
        _log.info(
            "调用 LLM: model=%s skill=%s payload_keys=%s",
            self._model,
            skill.name,
            sorted(user_payload),
        )

        log_handle = None
        if log_path is not None:
            log_path.parent.mkdir(parents=True, exist_ok=True)
            log_handle = log_path.open("a", encoding="utf-8")

        full_text_chunks: list[str] = []
        usage_data: dict[str, int] = {}
        try:
            with self._client.messages.stream(
                model=self._model,
                max_tokens=self._max_tokens,
                system=system_blocks,  # type: ignore[arg-type]
                messages=[{"role": "user", "content": user_message}],
            ) as stream:
                for event in stream:
                    if log_handle is not None:
                        log_handle.write(
                            json.dumps(_event_to_dict(event), ensure_ascii=False) + "\n"
                        )
                    if getattr(event, "type", "") == "content_block_delta":
                        delta = getattr(event, "delta", None)
                        if delta is not None and getattr(delta, "type", "") == "text_delta":
                            piece = delta.text  # type: ignore[attr-defined]
                            full_text_chunks.append(piece)
                            if on_text is not None:
                                on_text(piece)
                final_message = stream.get_final_message()
                usage = final_message.usage
                usage_data = {
                    "input_tokens": usage.input_tokens,
                    "output_tokens": usage.output_tokens,
                    "cache_read_input_tokens": getattr(usage, "cache_read_input_tokens", 0) or 0,
                    "cache_creation_input_tokens": getattr(
                        usage, "cache_creation_input_tokens", 0
                    ) or 0,
                }
        finally:
            if log_handle is not None:
                log_handle.close()

        text = "".join(full_text_chunks)
        _log.info(
            "LLM 调用完成: chars=%d in=%d out=%d cache_read=%d cache_create=%d",
            len(text),
            usage_data.get("input_tokens", 0),
            usage_data.get("output_tokens", 0),
            usage_data.get("cache_read_input_tokens", 0),
            usage_data.get("cache_creation_input_tokens", 0),
        )
        return LLMRunResult(text=text, **usage_data)

    def _format_user_payload(self, skill_name: str, payload: dict[str, object]) -> str:
        return (
            f"Use the `{skill_name}` skill to complete the task.\n\n"
            "Inputs (JSON):\n"
            "```json\n"
            + json.dumps(payload, ensure_ascii=False, indent=2, default=str)
            + "\n```\n"
        )


# ===================== 工厂 =====================


def create_default_client(settings: Settings) -> LLMClient:
    """根据 settings 选择默认实现。当前只有 Anthropic。"""
    return AnthropicClient(settings)


def _event_to_dict(event: object) -> dict[str, object]:
    """把 Anthropic 流式事件对象尽力转换为可序列化 dict。"""
    if hasattr(event, "model_dump"):
        try:
            return event.model_dump()  # type: ignore[no-any-return]
        except Exception:
            pass
    if hasattr(event, "__dict__"):
        return {k: str(v) for k, v in event.__dict__.items()}
    return {"repr": repr(event)}


__all__ = ["AnthropicClient", "LLMClient", "LLMRunResult", "create_default_client"]
