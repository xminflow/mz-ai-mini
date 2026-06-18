from __future__ import annotations

import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent
API_SRC = PROJECT_ROOT / "api" / "src"

if str(API_SRC) not in sys.path:
    sys.path.insert(0, str(API_SRC))

from community_backend import create_app


app = create_app()


def main() -> None:
    import uvicorn

    # 默认端口 8001，避免与现有 mz-ai-backend（8000）冲突。
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)


if __name__ == "__main__":
    main()
