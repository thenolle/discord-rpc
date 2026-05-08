# Contributing

Thank you for taking the time to contribute. Every improvement matters, whether it is a bug fix, a feature, or a documentation update.

---

## Table of Contents

- [Contributing](#contributing)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Getting Started](#getting-started)
  - [Development Setup](#development-setup)
  - [Workflow](#workflow)
  - [Commit Style](#commit-style)
  - [Code Style](#code-style)
  - [What to Work On](#what-to-work-on)

---

## Code of Conduct

This project follows the [Code of Conduct](./CODE_OF_CONDUCT.md). By participating you agree to uphold it.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Install** dependencies
4. **Create** a descriptive branch

```bash
git clone https://github.com/thenolle/discord-rpc.git
cd discord-rpc
pnpm install # or npm install
git checkout -b fix/my-bug-fix
```

---

## Development Setup

```bash
# Run in development mode
pnpm start # or npm start

# Build Windows executable
pnpm build:win # or npm run build:win
# Build macOS executable
pnpm build:mac # or npm run build:mac
# Build Linux executable
pnpm build:linux # or npm run build:linux
# Build all platforms
pnpm build # or npm run build
```

The app opens your browser automatically at the local GUI.

---

## Workflow

1. **Check existing issues and PRs** before starting - avoid duplicates
2. **Open an issue** first for significant changes or new features
3. **Work in a dedicated branch** - never directly on `main`
4. **Keep commits focused** - one logical change per commit
5. **Open a Pull Request** and fill in the template completely
6. **Address review feedback** promptly

Branch naming:

| Type        | Prefix         | Example                        |
|-------------|----------------|--------------------------------|
| Bug fix     | `fix/`         | `fix/proxy-cors-issue`         |
| Feature     | `feature/`     | `feature/preset-profiles`      |
| Docs        | `docs/`        | `docs/update-readme`           |
| Refactor    | `refactor/`    | `refactor/server-routes`       |
| Chore       | `chore/`       | `chore/update-dependencies`    |

---

## Commit Style

Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

Examples:
```
fix(proxy): handle Imgur redirect URLs correctly
feat(gui): add activity type selector to presence editor
docs(readme): update troubleshooting section
chore(deps): update ws to 8.18.1
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `chore`

---

## Code Style

- **No semicolons**
- **Single quotes**
- **DRY and modular** - no repeated logic
- **OOP where appropriate**
- **Document non-obvious logic** with inline comments
- **No unused variables**
- `'use strict'` at top of every Node.js file

---

## What to Work On

Look for issues labeled:

- `good first issue` - beginner-friendly
- `help wanted` - maintainer-approved scope
- `bug` - confirmed defects

If you have an idea not covered by an existing issue, open one first so we can discuss it before you invest time building it.