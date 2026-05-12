from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

PostIdSource = Literal[
    "aweme_id",
    "share_url_canonical",
    "share_url_short",
    "xhs_note_url",
]
NoteType = Literal["video", "image_text"]


class CommentItem(BaseModel):
    """A single top-level comment captured from the XHS detail overlay."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    author: Annotated[str, Field(max_length=256)]
    content: Annotated[str, Field(max_length=1024)]
    like_count: Annotated[int, Field(ge=-1)]
    time_text: Annotated[str, Field(max_length=64)]


class MaterialEntry(BaseModel):
    """A single saved piece of Douyin content. Both wire shape and SQLite row.

    `like_count`, `comment_count`, `share_count`, `collect_count` use -1 as the
    "not visible at capture time" sentinel; 0 means "visible and zero".
    """

    model_config = ConfigDict(extra="forbid", frozen=True)

    post_id: Annotated[str, Field(min_length=1, max_length=128)]
    post_id_source: PostIdSource
    share_url: Annotated[str, Field(min_length=1, max_length=2048)]
    share_text: Annotated[str, Field(min_length=1, max_length=4096)]
    caption: Annotated[str, Field(max_length=4096)]
    author_handle: Annotated[str, Field(min_length=1, max_length=256)]
    author_display_name: Annotated[str | None, Field(max_length=256)]
    hashtags: Annotated[list[Annotated[str, Field(max_length=64)]], Field(max_length=64)]
    music_id: Annotated[str | None, Field(max_length=128)]
    music_title: Annotated[str | None, Field(max_length=256)]
    like_count: Annotated[int, Field(ge=-1)]
    comment_count: Annotated[int, Field(ge=-1)]
    share_count: Annotated[int, Field(ge=-1)]
    collect_count: Annotated[int, Field(ge=-1)]
    captured_at: Annotated[
        str,
        Field(
            description=(
                "RFC 3339 UTC, ms precision, trailing Z. "
                "Example: 2026-05-02T12:34:56.789Z."
            ),
        ),
    ]
    captured_by_device: Annotated[str, Field(min_length=1, max_length=128)]
    note_type: NoteType = "video"
    comments: list[CommentItem] = []
