# i18n Content Checker

A Next.js web application that scans localized web pages for untranslated English content. Enter a URL, select target locales, and the tool will detect English text that may have been left untranslated.

## Supported Locales

- 🇵🇹 Portuguese (PT)
- 🇧🇷 Portuguese (BR)
- 🇮🇹 Italian
- 🇩🇪 German
- 🇫🇷 French
- 🇪🇸 Spanish

## Prerequisites

- [Volta](https://volta.sh/) (recommended for automatic Node.js/pnpm version management)
- Node.js 20.x
- pnpm 10.x

> Volta users: Node and pnpm versions are pinned in `package.json` — no manual setup needed.

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm commit` | Create a conventional commit (Commitizen) |
| `pnpm release` | Bump version & generate CHANGELOG |
| `pnpm release:minor` | Release as minor version bump |
| `pnpm release:major` | Release as major version bump |
| `pnpm release:first` | Generate the first release |

## Commit Convention

This project uses [Commitizen](https://github.com/commitizen/cz-cli) with the [Conventional Changelog](https://www.conventionalcommits.org/) format. Use `pnpm commit` instead of `git commit` to get an interactive prompt.

## Releasing

Versioning and changelog generation are handled by [standard-version](https://github.com/conventional-changelog/standard-version):

```bash
# First release
pnpm release:first

# Subsequent releases (auto-detects bump from commits)
pnpm release
```

This will:
1. Bump the version in `package.json`
2. Update `CHANGELOG.md`
3. Create a version commit and git tag
