# AI运营获客

A local-first desktop scaffold pairing an Electron + React + Tailwind + shadcn/ui frontend
with a Python (Typer) CLI backend, glued together by a single typed IPC seam (`ping`).

## Supported OSes

| Tier | OS |
|------|----|
| Primary (developed and verified) | Windows 11 |
| Secondary (supported, lightly verified) | macOS 13+ |
| Best-effort (not gated) | Linux |

## Toolchain versions

| Tool | Minimum | Notes |
|------|---------|-------|
| Node.js | 20 LTS | `corepack enable` recommended |
| pnpm | 9.x | `corepack prepare pnpm@latest --activate` |
| uv | 0.4 | Single binary; provisions Python automatically |
| Python | 3.11+ | Provided by `uv sync`; no pre-install needed |
| git | any modern | OS package manager |

## Frontend commands

Run from `frontend/`:

```powershell
pnpm install      # install dependencies (Electron, React, Tailwind, shadcn, zod)
pnpm dev          # launch the Electron app with HMR
pnpm build        # produce a production bundle under out/
pnpm typecheck    # tsc --build (strict mode on all entries)
pnpm test         # Vitest renderer smoke tests
pnpm lint         # ESLint with the renderer/feature/shared no-restricted-imports ban
```

## Backend commands

Run from `backend/`:

```powershell
uv sync                                       # install dependencies + interpreter
uv run python -m ua_agent ping --json         # success path → JSON on stdout, exit 0
uv run pyright                                # strict type-check the source tree
uv run pytest                                 # contract tests for the CLI
```

## Building the Windows installer

Two variants are planned. Only the **no-Python** variant ships today; the
**with-Python** variant (embedded interpreter + pre-installed venv) is a
follow-up.

### No-Python variant

End users must have `uv` on PATH — the installer bundles backend source
(`pyproject.toml`, `uv.lock`, `src/ua_agent`, `vendor/funasr_nano`) but
not the Python interpreter. `uv run` syncs deps on first launch.
The build script also seeds any detected `blogger-frames/` data into the
installer, so existing 博主分析内容 is shipped with the release.

From the repo root:

```powershell
pwsh scripts/build-installer-no-python.ps1
```

The script preflights `node`/`pnpm`/`uv`, stages the backend payload at
`frontend/build-resources/staging/backend/`, runs `pnpm install` +
`electron-rebuild` + `pnpm build`, then `electron-builder --win nsis`.
Output lands at `frontend/dist/AI运营获客-Setup-<version>-no-python.exe`.

A custom app icon may be added at `frontend/build/icon.ico` (256×256+);
without one, electron-builder falls back to the default Electron icon.

## End-to-end demo

1. From the repo root, `cd frontend && pnpm install`.
2. From the repo root, `cd backend && uv sync`.
3. From `frontend/`, run `pnpm dev`. An Electron window titled `ua-agent` opens.
4. Click the **Ping backend** button.
5. Within ≤ 3 seconds the screen displays a `timestamp` and `python` field sourced
   from the Python CLI — proving the renderer → main → CLI → main → renderer
   round-trip across the typed IPC seam.

The full step-by-step verification recipe (including the graceful-failure path and
the cross-cutting checks for FR-014 / SC-005 / SC-006) lives in
[`specs/001-init-fullstack/quickstart.md`](./specs/001-init-fullstack/quickstart.md).
