## ADDED Requirements

### Requirement: Build with Vite
SYSTEM SHALL build the frontend using Vite, outputting a static `dist/` directory deployable to Cloudflare Pages.

#### Scenario: Production build produces static assets
- **WHEN** `vite build` runs
- **THEN** output directory `dist/` contains `index.html`, bundled JS, and CSS
- **THEN** all assets are hashed for cache busting
- **THEN** Motion One library is bundled in the JS output (not loaded via `<script>` tag)

### Requirement: Runtime API config via Pages Function
SYSTEM SHALL provide a Cloudflare Pages Function at `/api/config` that returns both the API base URL and the channel name from environment variables.

#### Scenario: Config endpoint returns API URL and channel
- **WHEN** frontend calls `GET /api/config`
- **THEN** response is `{ "apiBaseUrl": "https://tg-api.aleeyoo.workers.dev", "channel": "leeyoooo" }`
- **THEN** `apiBaseUrl` comes from `env.API_BASE_URL` environment variable
- **THEN** `channel` comes from `env.CHANNEL` environment variable

#### Scenario: No env var configured
- **WHEN** `API_BASE_URL` is not set in Cloudflare dashboard
- **THEN** `/api/config` returns default value from `wrangler.toml` or throws descriptive error

### Requirement: Deploy via Wrangler
SYSTEM SHALL support `wrangler pages deploy` for production deployment.

#### Scenario: Deploy to Cloudflare Pages
- **WHEN** `wrangler pages deploy dist/` runs
- **THEN** static assets are uploaded to Cloudflare Pages
- **THEN** `/api/config` Pages Function is deployed alongside
- **THEN** site is accessible at `<project>.pages.dev`

### Requirement: Channel name configurable at runtime
SYSTEM SHALL use the channel name from `/api/config` runtime config, not a build-time env var.

#### Scenario: Different channel, no rebuild
- **WHEN** `CHANNEL` env var is changed in Cloudflare dashboard to "somechannel"
- **THEN** next page load fetches from `<apiBaseUrl>/api/v1/ch/somechannel/posts`
- **THEN** no code rebuild or redeploy is needed
