from __future__ import annotations

import base64
import json
from collections.abc import Callable
from datetime import datetime

from mz_ai_backend.core.exceptions import ValidationException

from ..dtos import (
    BloggerInsightCursor,
    BloggerInsightListItemResult,
    BloggerInsightPageSlice,
    ListPublicBloggerInsightsResult,
)


def decode_cursor(cursor: str | None) -> BloggerInsightCursor | None:
    if cursor is None:
        return None

    try:
        decoded = base64.urlsafe_b64decode(cursor.encode("utf-8")).decode("utf-8")
        payload = json.loads(decoded)
        sort_value = datetime.fromisoformat(payload["sort_value"])
        slug = payload["slug"]
    except (ValueError, KeyError, json.JSONDecodeError) as exc:
        raise ValidationException(message="Cursor is invalid.") from exc

    if not isinstance(slug, str) or slug == "":
        raise ValidationException(message="Cursor is invalid.")

    return BloggerInsightCursor(sort_value=sort_value, slug=slug)


def encode_cursor(cursor: BloggerInsightCursor) -> str:
    payload = {
        "sort_value": cursor.sort_value.isoformat(),
        "slug": cursor.slug,
    }
    return base64.urlsafe_b64encode(json.dumps(payload).encode("utf-8")).decode("utf-8")


def build_list_result(
    page: BloggerInsightPageSlice,
    *,
    sort_value_resolver: Callable[[BloggerInsightListItemResult], datetime],
) -> ListPublicBloggerInsightsResult:
    next_cursor: str | None = None
    if page.has_more and page.items:
        last_item = page.items[-1]
        next_cursor = encode_cursor(
            BloggerInsightCursor(
                sort_value=sort_value_resolver(last_item),
                slug=last_item.slug,
            )
        )
    return ListPublicBloggerInsightsResult(
        items=page.items,
        next_cursor=next_cursor,
        available_platforms=page.available_platforms,
        available_industries=page.available_industries,
    )
