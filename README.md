# Live Orderbook Terminal

A focused showcase of a multi-venue prediction-market terminal: shared stream hub, depth ladders, and live mid-price charting.

This repository demonstrates frontend systems work extracted from a production trading product. The demo runs fully offline.

## Features

- Single in-tab stream hub with refcounted venue subscriptions
- Reconnect with exponential backoff and stale-connection watchdog
- External-store snapshots via `useSyncExternalStore`
- Dual-venue orderbook ladders with depth visualization
- Live mid-price chart (Lightweight Charts)

## Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- Lightweight Charts
- Biome + Husky

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001).

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Typecheck and production build |
| `pnpm preview` | Preview the production build |
| `pnpm lint` | Run Biome checks |
| `pnpm format` | Format with Biome |

## Code Style

- Indentation: 2 spaces
- Line endings: LF
- Max line width: 100
- Quotes: single quotes
- Prefer TypeScript; avoid `any` unless necessary

## Notes

- This project uses Biome for linting and formatting (`biome.json`).
- Pre-commit hooks run Biome and TypeScript checks via Husky.
- Market updates are generated locally so the demo works without an external backend.
