## Context

The app runs as Vite dev server (localhost:3000) in development and Cloudflare Pages in production. In dev mode, the app fetches from `tg-api.aleeyoo.workers.dev` — a different origin — causing CORS errors. The current fallback (hardcoded config) still hits the CORS issue because `fetchPosts()` uses the absolute URL.

Additionally, UI text contrast is weak in dark mode:
- Lightbox link text at `rgba(255,255,255,0.5)` is hard to read over blurred dark overlay
- Folder dropdown items at `rgba(255,255,255,0.7)` could be sharper

## Goals / Non-Goals

**Goals:**
- Dev server fetches tg-api without CORS errors
- Production build still works with Pages Function config + direct API calls
- All UI text meets WCAG AA contrast (4.5:1 minimum) on dark backgrounds
- Zero behavioral change in production

**Non-Goals:**
- No changes to masonry, lightbox animation, or video logic
- No changes to API contract between frontend and tg-api
- No redesign of existing UI components — only color value tweaks

## Decisions

**1. Vite proxy for dev, not CORS headers on tg-api**

Could modify tg-api worker to add `Access-Control-Allow-Origin: *`. But Vite proxy is better because:
- Zero changes to the deployed API
- Works even if tg-api is on a shared plan without CORS config
- `/api/config` in dev falls through to 404 (expected — uses env var fallback)

**2. Distinct dev/prod fetch paths**

In `api.ts`, detect dev mode via `window.location.hostname === 'localhost'`. In dev:
- `fetchConfig()` → returns hardcoded/ENV config (don't hit 404)
- `fetchPosts()` → `fetch('/api/v1/...')` → Vite proxy → tg-api

In production (Cloudflare):
- `fetchConfig()` → `/api/config` Pages Function
- `fetchPosts()` → absolute URL from config

**3. Contrast values: match original project's body text approach**

The original `twitter-bookmarks-grid` used `color: #fff` for body-relevant text and `rgba(255,255,255,0.5)` only for secondary labels. We'll follow same pattern:
- `.lightbox-link` → `color: #fff` with reduced `opacity: 0.7` (allows hover transition to 1.0)
- `.folder-dropdown-item` → default `color: #fff` with `opacity: 0.7`, hover `opacity: 1`

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Vite proxy doesn't exist in production build | Proxy only configured in dev mode `server.proxy` — not included in built assets |
| env var `VITE_API_URL` needed for dev | Documented in README and `.env.example` — same as before |
| Production fetch path could break if domain changes | Config is fetched from Pages Function which gets it from env var — no hardcoded URLs in prod |
