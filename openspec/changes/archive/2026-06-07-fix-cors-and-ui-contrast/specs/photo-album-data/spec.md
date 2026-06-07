## MODIFIED Requirements

### Requirement: Fetch posts from API
SYSTEM SHALL fetch posts from tg-api endpoint at startup, using relative paths in dev and absolute URLs in production.

#### Scenario: Dev mode — fetch through Vite proxy
- **WHEN** app starts in dev mode (localhost)
- **THEN** system fetches `GET /api/v1/ch/{channel}/posts` (relative — proxied by Vite)
- **THEN** system parses JSON response containing `{ posts: [...] }`

#### Scenario: Production — fetch from configured API
- **WHEN** app starts on Cloudflare Pages
- **THEN** system fetches `GET {apiBaseUrl}/api/v1/ch/{channel}/posts` (absolute URL from config)
- **THEN** system parses JSON response containing `{ posts: [...] }`

#### Scenario: Fetch failure (network error)
- **WHEN** fetch fails (network error, 4xx, 5xx)
- **THEN** system logs detailed error to console
- **THEN** system renders an empty state message instead of the grid

### Requirement: Normalize posts to flat media items
SYSTEM SHALL flatten each post into individual media items for rendering. In dev mode, media src paths remain relative (through Vite proxy). In production, prepend apiBaseUrl.

#### Scenario: Dev mode — relative proxy path
- **WHEN** app runs on localhost
- **THEN** block's `proxy` path (e.g., `/static/https://...`) is used as-is (relative)
- **THEN** images load from `localhost:3000/static/https://...` which Vite proxies to tg-api

#### Scenario: Production — absolute URL
- **WHEN** app runs on Cloudflare Pages
- **THEN** `apiBaseUrl` is prepended to block's `proxy` path
- **THEN** images load from `https://tg-api.aleeyoo.workers.dev/static/https://...`
