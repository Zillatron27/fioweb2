# FIOWeb 2

Account management portal for the [FIO](https://doc.fnar.net) ecosystem — the community data API for [Prosperous Universe](https://prosperousuniverse.com).

Manage your FIO account, API keys, data sharing permissions and groups so that community tools can access your game data.

## Features

- **Account management** — login, registration, password changes
- **API key management** — create, list, and revoke API keys for external tools
- **Permission management** — grant and revoke data sharing permissions per user
- **Group management** — create groups, invite members, manage roles and shared permissions
- **Three themes** — dark (default), light, and colorblind-safe
- **Responsive** — full sidebar on desktop, hamburger menu on mobile

## Tech Stack

- React 19 + TypeScript (strict)
- Vite
- CSS custom properties (no frameworks)
- React Router (hash-based routing)
- FIO API V2 (`api.fnar.net`)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # Production build → dist/
npm run typecheck   # Type checking
npm run preview     # Preview production build
```

## Deployment

Cloudflare Pages — auto-deploys from `main`.
