## ADDED Requirements

### Requirement: Vite dev server proxies /api requests
SYSTEM SHALL configure Vite dev server to proxy `/api` requests to the tg-api backend, avoiding CORS errors during development.

#### Scenario: Dev server proxy on /api/posts
- **WHEN** app runs with `npm run dev` (Vite dev server)
- **THEN** a fetch to `/api/v1/ch/leeyoooo/posts` is proxied to `https://tg-api.aleeyoo.workers.dev/api/v1/ch/leeyoooo/posts`
- **THEN** response is forwarded with no CORS errors

#### Scenario: Dev server proxy on /api/static (media proxy)
- **WHEN** fetch to `/api/static/https://cdn5.telesco.pe/file/xxx.jpg`
- **THEN** request is proxied to `https://tg-api.aleeyoo.workers.dev/static/https://cdn5.telesco.pe/file/xxx.jpg`
- **THEN** response headers include correct content-type

### Requirement: API fetch distinguishes dev vs production
SYSTEM SHALL use relative `/api/v1/ch/...` paths through Vite proxy in development and absolute URLs from config in production.

#### Scenario: Dev mode uses proxy path
- **WHEN** app runs on localhost
- **THEN** fetchConfig() skips /api/config (not available in dev) and uses fallback / env vars
- **THEN** fetchPosts() calls `fetch("/api/v1/ch/{channel}/posts")` instead of absolute URL
- **THEN** normalized media items' src URLs use the proxy path (relative to dev server)

#### Scenario: Production uses absolute URLs
- **WHEN** app runs on Cloudflare Pages
- **THEN** fetchConfig() calls `/api/config` which returns `{ apiBaseUrl, channel }`
- **THEN** fetchPosts() calls `fetch("{apiBaseUrl}/api/v1/ch/{channel}/posts")`
- **THEN** normalized media items' src URLs are absolute (prepended with apiBaseUrl)
