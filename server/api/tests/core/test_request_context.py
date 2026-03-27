from __future__ import annotations

import asyncio

import pytest

from mz_ai_backend.core.request_context import (
    RequestContext,
    get_request_context,
    get_request_id,
    reset_request_context,
    set_request_context,
)


def test_request_context_can_be_set_and_reset() -> None:
    context = RequestContext(
        request_id="request-100",
        method="GET",
        path="/health",
        client_ip="127.0.0.1",
    )
    token = set_request_context(context)

    assert get_request_context() == context
    assert get_request_id() == "request-100"

    reset_request_context(token)

    with pytest.raises(RuntimeError, match="Request context is not available."):
        get_request_context()


@pytest.mark.asyncio
async def test_request_context_is_isolated_between_coroutines() -> None:
    async def run_context(request_id: str) -> str:
        token = set_request_context(
            RequestContext(
                request_id=request_id,
                method="GET",
                path="/health",
                client_ip="127.0.0.1",
            )
        )
        try:
            await asyncio.sleep(0)
            return get_request_id()
        finally:
            reset_request_context(token)

    assert await asyncio.gather(run_context("request-a"), run_context("request-b")) == [
        "request-a",
        "request-b",
    ]
