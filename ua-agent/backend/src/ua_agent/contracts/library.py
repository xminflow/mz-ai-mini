from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

from .capture import MaterialEntry
from .error import ErrorEnvelope


class LibraryListFilters(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True, populate_by_name=True)

    from_: Annotated[str | None, Field(alias="from")]
    to: str | None
    author: Annotated[str | None, Field(max_length=256)]
    limit: Annotated[int, Field(ge=1, le=200)]
    offset: Annotated[int, Field(ge=0)]


class LibraryListSuccess(BaseModel):
    """Success payload of `library list --json`."""

    model_config = ConfigDict(extra="forbid", frozen=True, populate_by_name=True)

    schema_version: Literal["1"] = "1"
    ok: Literal[True] = True
    entries: list[MaterialEntry]
    total: Annotated[int, Field(ge=0)]
    library_total: Annotated[int, Field(ge=0)]
    applied_filters: LibraryListFilters


LibraryListResult = Annotated[
    LibraryListSuccess | ErrorEnvelope,
    Field(discriminator="ok"),
]


class LibraryDeleteSuccess(BaseModel):
    """Success payload of `library delete --json`."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    schema_version: Literal["1"] = "1"
    ok: Literal[True] = True
    deleted_post_id: Annotated[str, Field(min_length=1, max_length=128)]
    restored: Literal[False] = False


LibraryDeleteResult = Annotated[
    LibraryDeleteSuccess | ErrorEnvelope,
    Field(discriminator="ok"),
]
