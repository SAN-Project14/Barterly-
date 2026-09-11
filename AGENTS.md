# Barterly — Base44 Dev Environment

## What this is
A frontend-only React 19 + Vite 6 + Tailwind 4 app (item-barter marketplace).
No backend server exists despite `express`/`dotenv` in package.json — the app runs
in **mock mode** when `VITE_API_URL` is unset (all services fall back to mock data
in `src/mocks/`).

## Running it
```
docker compose -f docker-compose.base44.yml up -d
```
- Node 22 base image, source bind-mounted at `/app`, deps installed at startup.
- Vite dev server on port 3000, host 0.0.0.0.
- HMR is disabled (`DISABLE_HMR=true`) to prevent flicker during edits; use
  `reload_preview` after changes if the UI doesn't update.

## Secrets
None required to boot. `GEMINI_API_KEY` and `VITE_API_URL` appear in `.env.example`
but are not referenced in the source — the app boots and renders fully in mock mode
without them. If a real backend or Gemini integration is added later, wire those
via `/run/base44/app.env`.

## Known warnings
- `src/components/common/Badge.tsx` has a duplicate `case 'rejected'` clause
  (non-fatal esbuild warning).
