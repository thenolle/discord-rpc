# Contributing

Thank you for taking the time to contribute to Discord RPC. Every improvement matters, whether it is a bug fix, feature, documentation update, or small refinement.

---

## Table of Contents

- [Contributing](#contributing)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Getting Started](#getting-started)
  - [Development Setup](#development-setup)
  - [Workflow](#workflow)
    - [Branch naming](#branch-naming)
  - [Commit Style](#commit-style)
    - [Examples](#examples)
    - [Supported types](#supported-types)
  - [Code Style](#code-style)
    - [Practical guidelines](#practical-guidelines)
  - [What to Work On](#what-to-work-on)
  - [Before Submitting](#before-submitting)

---

## Code of Conduct

This project follows the [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

---

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally.
3. Install dependencies with Bun.
4. Create a descriptive branch before making changes.

```bash
git clone https://github.com/thenolle/discord-rpc.git
cd discord-rpc
bun install
git checkout -b fix/my-bug-fix
```

---

## Development Setup

Run the app in development mode:

```bash
bun run start
```

Build platform binaries with:

```bash
bun run build:win
bun run build:win:arm
bun run build:mac
bun run build:mac:x64
bun run build:linux
bun run build:all
```

The app opens the local GUI in your default browser during development and when launched normally from a compiled build.

---

## Workflow

1. Check existing issues and pull requests before starting to avoid duplicate work.
2. Open an issue first for larger changes or new features.
3. Work in a dedicated branch; never commit directly to `main`.
4. Keep commits focused and easy to review.
5. Open a pull request with a clear description of what changed and why.
6. Respond to review feedback promptly and keep the branch up to date.

### Branch naming

| Type | Prefix | Example |
|---|---|---|
| Bug fix | `fix/` | `fix/proxy-cors-issue` |
| Feature | `feature/` | `feature/preset-profiles` |
| Docs | `docs/` | `docs/update-readme` |
| Refactor | `refactor/` | `refactor/server-routes` |
| Chore | `chore/` | `chore/update-dependencies` |

---

## Commit Style

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

### Examples

```text
fix(proxy): handle Imgur redirect URLs correctly
feat(gui): add activity type selector to presence editor
docs(readme): update troubleshooting section
chore(deps): update ws to 8.18.1
```

### Supported types

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `perf`
- `chore`

Keep commit messages concise, specific, and written in imperative voice.

---

## Code Style

Please follow the project’s existing style:

- No semicolons.
- Single quotes.
- Prefer small, modular functions over repeated logic.
- Use OOP where it improves clarity.
- Document non-obvious logic with short inline comments.
- Avoid unused variables.
- Keep changes consistent with the current Bun-based TypeScript codebase.
- Use `use strict` only where it is actually required by the file style or runtime context.

### Practical guidelines

- Keep files focused and easy to scan.
- Prefer clarity over cleverness.
- Preserve existing naming patterns unless there is a strong reason to change them.
- Avoid unnecessary dependencies unless they clearly reduce complexity or improve reliability.

---

## What to Work On

Look for issues labeled:

- `good first issue` — beginner-friendly.
- `help wanted` — maintainer-approved and useful.
- `bug` — confirmed defects that need fixes.

If you have an idea that is not covered by an existing issue, open one first so it can be discussed before you invest time building it.

---

## Before Submitting

Before opening a pull request, make sure your changes are:

- Tested manually in the app.
- Free of obvious console errors.
- Consistent with the current code style.
- Described clearly in the pull request summary.

Small, well-scoped pull requests are easier to review and merge.