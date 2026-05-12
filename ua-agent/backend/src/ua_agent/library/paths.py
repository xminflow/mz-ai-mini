from __future__ import annotations

import os
from pathlib import Path

from platformdirs import user_data_dir

_APP_NAME = "ua-agent"


def library_data_dir() -> Path:
    """Return the OS-conventional user-data dir for ua-agent.

    Honors the test override `UA_AGENT_DATA_DIR` so contract tests can pin the
    library DB to a tmp_path without monkeypatching platformdirs.
    """
    override = os.environ.get("UA_AGENT_DATA_DIR")
    base = Path(override) if override else Path(user_data_dir(_APP_NAME, appauthor=False, roaming=False))
    base.mkdir(parents=True, exist_ok=True)
    return base


def library_db_path() -> Path:
    return library_data_dir() / "library.db"


def asr_model_dir() -> Path:
    """Directory holding the Fun-ASR-Nano-2512 model files.

    On Windows we MUST use %APPDATA% (Roaming) to match the Node-side
    `userDataDir()` (frontend/src/utility/keyword-crawl/infra/paths.ts).
    `library_data_dir()` uses %LOCALAPPDATA% via platformdirs default and
    would diverge — Node writes to one location, Python reads from another.
    No bootstrap (does not mkdir) — the downloader owns that.
    """
    if os.name == "nt":
        appdata = os.environ.get("APPDATA")
        if appdata:
            return Path(appdata) / "ua-agent" / "asr" / "Fun-ASR-Nano-2512"
    return library_data_dir() / "asr" / "Fun-ASR-Nano-2512"
