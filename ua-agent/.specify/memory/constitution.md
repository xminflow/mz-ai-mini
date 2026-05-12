<!--
SYNC IMPACT REPORT
==================
Version change: (template, unversioned) → 1.0.0
Bump rationale: Initial ratification — first concrete constitution replacing the
unfilled template. MAJOR baseline per semver convention for project governance.

Modified principles (placeholder → concrete):
  - [PRINCIPLE_1_NAME]              → I. Feature-Based Frontend Architecture
  - [PRINCIPLE_2_NAME]              → II. CLI-Only Python Backend Boundary
  - [PRINCIPLE_3_NAME]              → III. End-to-End Type Safety
  - [PRINCIPLE_4_NAME]              → IV. Local-First, Offline by Default
  - [PRINCIPLE_5_NAME]              → V. Design System Discipline (Tailwind + shadcn)

Added sections:
  - Technology & Architecture Constraints (replaces [SECTION_2_NAME])
  - Development Workflow & Quality Gates (replaces [SECTION_3_NAME])
  - Governance (filled)

Removed sections: none

Templates requiring updates:
  - .specify/templates/plan-template.md       ✅ no edit needed (Constitution
    Check section is dynamic — gates are derived at /speckit.plan time from this
    file). Reviewed.
  - .specify/templates/spec-template.md       ✅ no edit needed (spec template
    is technology-agnostic and unaffected by constitutional principles).
    Reviewed.
  - .specify/templates/tasks-template.md      ✅ no edit needed (task structure
    is generic; principle-driven categories will appear via /speckit.tasks).
    Reviewed.
  - .specify/templates/commands/*.md          ✅ N/A — directory not present.
  - README.md / docs/quickstart.md            ✅ N/A — not present in repo.
  - CLAUDE.md                                 ✅ no edit needed — already notes
    that the constitution is template state and must be filled before /plan.
    The note in CLAUDE.md will be updated organically on next CLAUDE.md refresh.

Follow-up TODOs:
  - none. Ratification date set to today (2026-05-02) since this is the
    project's first constitution and no prior adoption date exists.
-->

# ua-agent Constitution

## Core Principles

### I. Feature-Based Frontend Architecture

The Electron renderer MUST be organized by feature, not by technical layer. Each
feature owns its own folder under `src/features/<feature-name>/` containing its
UI components, hooks, state, types, and feature-local utilities. Cross-feature
sharing happens only through `src/shared/` (UI primitives, hooks, utils) and
`src/lib/` (third-party adapters); no feature may import from another feature's
internals. Feature folders MUST be removable as a unit without leaving orphan
imports elsewhere.

**Rationale:** Feature-based layout keeps the blast radius of UI changes
predictable and lets the renderer scale beyond a single-page tool without
turning into a tangle of layer-keyed directories.

### II. CLI-Only Python Backend Boundary

The Python backend is a local subprocess invoked exclusively via its CLI. It
MUST NOT expose long-running network sockets, embedded HTTP servers, IPC
sockets, or in-process FFI for application logic. The Electron main process
spawns the CLI per request (or per session for streamed work), passes inputs
via arguments / stdin, and reads results from stdout (errors on stderr). Every
backend command MUST support a `--json` mode that emits a single
machine-parseable JSON object/array on stdout for the Electron client; a
human-readable mode is allowed only as a developer convenience. The CLI
contract (subcommands, flags, stdout schema, exit codes) is the load-bearing
interface and MUST be versioned and documented before any new client code
consumes it.

**Rationale:** A CLI boundary keeps the backend independently testable from the
terminal, removes the need to ship and secure a local server, and makes the
client/server seam obvious in code review.

### III. End-to-End Type Safety

TypeScript MUST be configured in strict mode (`strict: true`, no implicit
`any`). Python code MUST use type hints on all public functions and CLI entry
points, and MUST pass a static type check (mypy or pyright) in CI before merge.
The shape of every JSON payload crossing the CLI boundary MUST be defined once
as a schema (e.g., Pydantic model on the Python side, mirrored TypeScript type
on the renderer side), and the renderer MUST validate inbound CLI JSON at the
boundary before trusting it. Untyped `any` / `dict[str, Any]` at the boundary
is a constitutional violation and requires an entry in Complexity Tracking.

**Rationale:** Two languages share one wire format; without enforced typing on
both sides, drift between renderer expectations and CLI output becomes the
dominant source of bugs.

### IV. Local-First, Offline by Default

The application MUST function with no network connectivity for all features
that do not intrinsically require a remote service. User data, configuration,
and intermediate artifacts MUST live on the local filesystem in
OS-conventional locations. Network calls are opt-in, must be triggered by an
explicit user action (or a clearly disclosed background sync), and MUST fail
gracefully — degraded functionality is preferred over a blocking error
dialog. Telemetry, auto-update pings, and analytics are network calls and fall
under this rule.

**Rationale:** This is a local agent product; treating it as a cloud client
would betray the user expectation that comes with shipping an Electron desktop
binary.

### V. Design System Discipline (Tailwind + shadcn)

All renderer styling MUST come from Tailwind utility classes or shadcn
components. Hand-rolled CSS files, inline `style={{...}}` objects, and
non-shadcn component libraries are NOT permitted in feature code; exceptions
require a documented justification in Complexity Tracking and live only under
`src/shared/ui/`. New visual primitives MUST be added by composing existing
shadcn components or by extending the Tailwind theme tokens — never by
forking shadcn source into the feature folder.

**Rationale:** A two-source design system (Tailwind tokens + shadcn primitives)
only stays coherent if every feature uses it; ad-hoc CSS silently rots
consistency and makes later theming impossible.

## Technology & Architecture Constraints

- **Frontend stack:** Electron + TypeScript. Renderer uses React with Tailwind
  CSS and shadcn/ui. Build tooling is the project's chosen Electron-friendly
  bundler (Vite or equivalent); whichever is selected MUST be the only bundler.
- **Backend stack:** Python (3.11+ recommended). The backend ships as a CLI
  entry point. Packaging for distribution alongside the Electron binary (e.g.,
  PyInstaller, embedded interpreter) is a deployment concern but MUST preserve
  the CLI contract verbatim.
- **Process model:** Renderer ↔ Main IPC is allowed and expected. Main ↔
  Python is CLI subprocess only (see Principle II). The renderer MUST NOT
  spawn the Python CLI directly — all subprocess management lives in the
  Electron main process.
- **Filesystem layout:** `frontend/` (or repo-root `src/` if there is no
  separate backend codebase) for the Electron app; `backend/` for the Python
  CLI. The chosen layout is fixed once the first feature plan is accepted.
- **Secrets:** No secrets in the repo. Local user secrets live in OS keychain
  or a user-scoped config file outside the project tree.

## Development Workflow & Quality Gates

- **Spec-Driven Development:** All non-trivial work MUST go through the
  speckit pipeline: `/speckit.constitution` → `/speckit.specify` →
  `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`.
  Review gates between stages MUST NOT be skipped.
- **Constitution Check:** `/speckit.plan` MUST evaluate the plan against every
  principle in this document. Any violation MUST appear in the plan's
  Complexity Tracking table with a justification and a rejected simpler
  alternative; otherwise the plan does not pass the gate.
- **CLI contract change control:** Any change to a Python CLI subcommand,
  flag, JSON output schema, or exit code is a contract change. Contract
  changes MUST update both the renderer-side type and the backend schema in
  the same PR, and MUST appear under `contracts/` in the feature folder.
- **Testing posture:** Tests are not blanket-mandatory, but the following are
  non-negotiable when present in a feature: (a) every CLI subcommand exposed
  to the renderer has at least one contract test asserting its JSON schema
  and exit code; (b) any feature that mutates user data on disk has at least
  one integration test that exercises the real filesystem path. Renderer
  unit tests are encouraged but not required.
- **Code review:** Every PR description MUST state which principles were
  touched and confirm the Constitution Check was reconsidered if the plan
  changed mid-implementation.

## Governance

This constitution supersedes ad-hoc conventions and prior informal practices
in this repository. When a guideline elsewhere (a README, a comment, a
chat-log decision) conflicts with this file, this file wins until amended.

**Amendment procedure:** Amendments are made by editing this file via
`/speckit.constitution`, which MUST produce an updated Sync Impact Report,
bump the version per the policy below, and refresh the Last Amended date.
Amendments that materially change a principle's enforcement MUST be
accompanied by a migration note for any in-flight feature plans that the
change would now flag as violations.

**Versioning policy (semantic):**
- **MAJOR** — a principle is removed, redefined incompatibly, or its
  enforcement is materially weakened/strengthened in a way that retroactively
  invalidates existing approved plans.
- **MINOR** — a new principle or a new normative section is added, or
  existing guidance is materially expanded.
- **PATCH** — wording clarifications, typo fixes, rationale tightening, or
  non-semantic refinements that do not change what is permitted or required.

**Compliance review:** The Constitution Check inside `/speckit.plan` is the
primary compliance gate. In addition, `/speckit.analyze` MUST surface any
drift between an in-progress feature's tasks/spec and the principles here.
Reviewers SHOULD reject PRs whose diff contradicts a principle without a
corresponding Complexity Tracking entry.

**Runtime guidance:** Day-to-day, repository-specific operational guidance
(toolchain quirks, repo layout, hook behavior) lives in `CLAUDE.md` at the
repository root. `CLAUDE.md` is subordinate to this constitution; if the two
disagree, this constitution wins and `CLAUDE.md` MUST be updated.

**Version**: 1.0.0 | **Ratified**: 2026-05-02 | **Last Amended**: 2026-05-02
