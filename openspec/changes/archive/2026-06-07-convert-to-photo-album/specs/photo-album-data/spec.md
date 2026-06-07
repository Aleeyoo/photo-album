## ADDED Requirements

### Requirement: Fetch posts from API
SYSTEM SHALL fetch posts from tg-api endpoint at startup, using the API base URL obtained from `/api/config`.

#### Scenario: Successful fetch
- **WHEN** app starts and API base URL is configured
- **THEN** system fetches `GET {apiBaseUrl}/api/v1/ch/{channel}/posts`
- **THEN** system parses JSON response containing `{ posts: [...] }`

#### Scenario: Fetch failure (network error)
- **WHEN** fetch fails (network error, 4xx, 5xx)
- **THEN** system logs detailed error to console
- **THEN** system renders an empty state message instead of the grid

### Requirement: Normalize posts to flat media items
SYSTEM SHALL flatten each post into individual media items for rendering. Each image or video block becomes one item.

#### Scenario: Post with single image block
- **WHEN** post has one `type: "image"` block
- **THEN** system creates one `MediaItem` with `type: "image"`, `src` = block's `proxy` field, `width`/`height` = block dimensions, `title`/`tags`/`datetime` from parent post

#### Scenario: Post with multiple image blocks
- **WHEN** post has 3 `type: "image"` blocks
- **THEN** system creates 3 separate `MediaItem` entries, each with its own `src`/`width`/`height` and shared `title`/`tags`/`datetime` from parent post

#### Scenario: Post with video block
- **WHEN** post has `type: "video"` block
- **THEN** system creates `MediaItem` with `type: "video"`, `src` = block's `proxy` field, video-specific fields preserved (`width`, `height`, `isRound`)

#### Scenario: Post with non-visual blocks (text, reply, link_preview)
- **WHEN** post has only `text` / `reply` / `link_preview` blocks
- **THEN** system does NOT create any `MediaItem` for that post
- **THEN** post is excluded from the grid

### Requirement: Prepend API base URL to proxy paths
SYSTEM SHALL prepend the API base URL to relative `proxy` fields to form absolute URLs.

#### Scenario: Relative proxy path resolved
- **WHEN** block has `proxy: "/static/https://cdn5.telesco.pe/file/xxx.jpg"`
- **THEN** system produces `src: "https://tg-api.aleeyoo.workers.dev/static/https://cdn5.telesco.pe/file/xxx.jpg"`

### Requirement: Tags mapped to filter labels
SYSTEM SHALL collect unique `tags` across all posts and use them as filter options.

#### Scenario: Tags extracted for dropdown
- **WHEN** posts contain tags `["旅行"]`, `["科技", "工具"]`, and `["旅行"]`
- **THEN** filter dropdown shows options: "All", "旅行", "科技", "工具"
- **THEN** selecting "旅行" shows media items from both posts tagged "旅行"
