from __future__ import annotations

import re
from collections.abc import Callable
from pathlib import Path
from urllib.parse import unquote, urlsplit

from .models import CaseImportConfig, ResolvedLocalAsset


_MARKDOWN_IMAGE_PATTERN = re.compile(r"!\[(?P<alt>[^\]]*)\]\((?P<target>[^)\r\n]+)\)")
_TOP_LEVEL_NESTED_KEYS = {
    "tags",
    "rework",
    "ai_driven_analysis",
    "market",
    "business_model",
    "how_to_do",
}


def load_case_import_config(case_dir: Path) -> CaseImportConfig:
    """Load one case directory config file into a validated model."""

    config_path = _locate_config_path(case_dir)
    raw_payload = _parse_supported_yaml(config_path)
    return CaseImportConfig.model_validate(raw_payload)


def extract_markdown_title(markdown_content: str) -> str:
    """Return the first H1 heading from markdown content."""

    for line in markdown_content.splitlines():
        stripped_line = line.strip()
        if stripped_line.startswith("# "):
            title = stripped_line[2:].strip()
            if title:
                return title
    raise ValueError("Markdown content must contain a level-1 heading.")


def rewrite_markdown_local_images(
    markdown_content: str,
    *,
    resolve_uploaded_url: Callable[[str], str],
) -> str:
    """Replace local markdown image destinations with uploaded asset URLs."""

    def replace_match(match: re.Match[str]) -> str:
        destination = _extract_image_destination(match.group("target"))
        if _is_remote_reference(destination):
            return match.group(0)

        uploaded_url = resolve_uploaded_url(destination)
        return f"![{match.group('alt')}]({uploaded_url})"

    return _MARKDOWN_IMAGE_PATTERN.sub(replace_match, markdown_content)


def extract_markdown_image_destinations(markdown_content: str) -> tuple[str, ...]:
    """Return markdown image destinations in source order."""

    return tuple(
        _extract_image_destination(match.group("target"))
        for match in _MARKDOWN_IMAGE_PATTERN.finditer(markdown_content)
    )


def resolve_local_asset(case_dir: Path, reference: str) -> ResolvedLocalAsset:
    """Resolve one local asset reference within the case directory boundary."""

    normalized_reference = _strip_required_reference(reference)
    if _is_remote_reference(normalized_reference):
        raise ValueError(f"Expected a local asset path, got '{normalized_reference}'.")

    case_root = case_dir.resolve()
    relative_reference = unquote(normalized_reference).replace("\\", "/")
    candidate_path = (case_root / Path(relative_reference)).resolve()

    try:
        relative_path = candidate_path.relative_to(case_root).as_posix()
    except ValueError as exc:
        raise ValueError(
            f"Asset path '{normalized_reference}' escapes the case directory."
        ) from exc

    if not candidate_path.is_file():
        raise ValueError(f"Asset file '{normalized_reference}' does not exist.")

    return ResolvedLocalAsset(source_path=candidate_path, relative_path=relative_path)


def _locate_config_path(case_dir: Path) -> Path:
    candidate_paths = [
        case_dir / "config.yml",
        case_dir / "config.yaml",
    ]
    existing_paths = [path for path in candidate_paths if path.is_file()]

    if not existing_paths:
        raise ValueError("Case directory must contain config.yml or config.yaml.")
    if len(existing_paths) > 1:
        raise ValueError("Case directory must not contain both config.yml and config.yaml.")
    return existing_paths[0]


def _parse_supported_yaml(config_path: Path) -> dict[str, object]:
    payload: dict[str, object] = {}
    current_section: str | None = None
    current_list_key: str | None = None

    for line_number, raw_line in enumerate(
        config_path.read_text(encoding="utf-8").splitlines(),
        start=1,
    ):
        stripped_line = raw_line.strip()
        if stripped_line == "" or stripped_line.startswith("#"):
            continue

        indent = len(raw_line) - len(raw_line.lstrip(" "))
        if indent not in (0, 2):
            raise ValueError(
                f"Unsupported indentation in {config_path.name} at line {line_number}."
            )

        if indent == 0:
            current_section = None
            current_list_key = None

            if stripped_line.endswith(":"):
                key = stripped_line[:-1].strip()
                if key not in _TOP_LEVEL_NESTED_KEYS:
                    raise ValueError(
                        f"Unsupported top-level section '{key}' in {config_path.name} "
                        f"at line {line_number}."
                    )
                if key == "tags":
                    payload[key] = []
                    current_list_key = key
                else:
                    payload[key] = {}
                    current_section = key
                continue

            key, value = _split_key_value(stripped_line, config_path, line_number)
            payload[key] = _parse_scalar(value)
            continue

        if current_list_key == "tags":
            if not stripped_line.startswith("- "):
                raise ValueError(
                    f"Unsupported list item syntax in {config_path.name} at line {line_number}."
                )
            tag_list = payload.get("tags")
            if not isinstance(tag_list, list):
                raise ValueError(f"Invalid tags structure in {config_path.name}.")
            tag_list.append(_parse_scalar(stripped_line[2:]))
            continue

        if current_section is None:
            raise ValueError(
                f"Unexpected nested field in {config_path.name} at line {line_number}."
            )

        key, value = _split_key_value(stripped_line, config_path, line_number)
        section_payload = payload.get(current_section)
        if not isinstance(section_payload, dict):
            raise ValueError(
                f"Section '{current_section}' in {config_path.name} must be a mapping."
            )
        section_payload[key] = _parse_scalar(value)

    return payload


def _split_key_value(
    stripped_line: str,
    config_path: Path,
    line_number: int,
) -> tuple[str, str]:
    if ":" not in stripped_line:
        raise ValueError(
            f"Expected key/value syntax in {config_path.name} at line {line_number}."
        )
    key, value = stripped_line.split(":", 1)
    normalized_key = key.strip()
    if normalized_key == "":
        raise ValueError(f"Field name must not be blank in {config_path.name}.")
    return normalized_key, value.strip()


def _parse_scalar(value: str) -> str:
    normalized_value = value.strip()
    if (
        len(normalized_value) >= 2
        and normalized_value[0] == normalized_value[-1]
        and normalized_value[0] in {"'", '"'}
    ):
        return normalized_value[1:-1]
    return normalized_value


def _extract_image_destination(target: str) -> str:
    normalized_target = target.strip()
    if normalized_target.startswith("<") and normalized_target.endswith(">"):
        normalized_target = normalized_target[1:-1].strip()

    for delimiter in (' "', " '"):
        delimiter_index = normalized_target.find(delimiter)
        if delimiter_index > 0:
            return normalized_target[:delimiter_index].strip()
    return normalized_target


def _is_remote_reference(reference: str) -> bool:
    split_result = urlsplit(reference)
    return split_result.scheme in {"http", "https", "data"}


def _strip_required_reference(reference: str) -> str:
    normalized_reference = reference.strip()
    if normalized_reference == "":
        raise ValueError("Asset reference must not be blank.")
    return normalized_reference
