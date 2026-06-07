## MODIFIED Requirements

### Requirement: Runtime API config via Pages Function
SYSTEM SHALL provide a Cloudflare Pages Function at `/api/config` that returns the API base URL and channel name from environment variables, with CORS headers explicitly set.

#### Scenario: Config endpoint returns API URL and channel with CORS headers
- **WHEN** frontend calls `GET /api/config`
- **THEN** response headers include `Access-Control-Allow-Origin: *`
- **THEN** response body is `{ "apiBaseUrl": "https://tg-api.aleeyoo.workers.dev", "channel": "leeyoooo" }`
- **THEN** `apiBaseUrl` comes from `env.API_BASE_URL` environment variable
- **THEN** `channel` comes from `env.CHANNEL` environment variable

#### Scenario: No env var configured
- **WHEN** `API_BASE_URL` is not set in Cloudflare dashboard
- **THEN** `/api/config` returns default value from `wrangler.toml` or throws descriptive error
