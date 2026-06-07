## ADDED Requirements

### Requirement: Fetch flattened media from dedicated endpoints
SYSTEM SHALL fetch media items via `/media/images` and `/media/videos` instead of flattening from `/posts`.

#### Scenario: Both endpoints called in parallel
- **WHEN** app initializes
- **THEN** system calls `GET /api/v1/ch/{ch}/media/images` and `GET /api/v1/ch/{ch}/media/videos` concurrently
- **THEN** results are merged into a single `MediaItem[]`, sorted by time descending
- **THEN** no client-side block flattening occurs

#### Scenario: One endpoint fails
- **WHEN** `/media/images` fails but `/media/videos` succeeds
- **THEN** system logs error and renders available video items
- **THEN** user sees partial data instead of blank page

### Requirement: Fetch tags with counts from API
SYSTEM SHALL fetch tags from `/tags` endpoint.

#### Scenario: Tags loaded from API
- **WHEN** app initializes
- **THEN** system calls `GET /api/v1/ch/{ch}/tags`
- **THEN** filter dropdown shows tag names with `{name} ({count})`
- **THEN** selecting a tag filters media items as before

### Requirement: Fetch single post detail
SYSTEM SHALL fetch post details from `/posts/:id` when lightbox opens.

#### Scenario: Lightbox fetches full post
- **WHEN** user clicks a media item
- **THEN** system calls `GET /api/v1/ch/{ch}/posts/{postId}`
- **THEN** lightbox shows full post content (complete text, all blocks, reactions)

### Requirement: Infinite scroll pagination
SYSTEM SHALL fetch additional pages using `before` cursor when user scrolls near bottom.

#### Scenario: Load more on scroll
- **WHEN** user scrolls within 800px of grid bottom
- **THEN** system calls `/media/images?before={oldestId}` and `/media/videos?before={oldestId}`
- **THEN** new items are appended to existing array, masonry rebuilt, re-rendered

#### Scenario: No more pages
- **WHEN** API returns empty items array for a page
- **THEN** system stops attempting further fetches
- **THEN** no infinite scroll spinner is shown

### Requirement: Video poster as grid thumbnail
SYSTEM SHALL use `poster` field from video blocks as the thumbnail image in grid cards.

#### Scenario: Video with poster
- **WHEN** video `MediaItem` has non-empty `poster`
- **THEN** grid card renders `<img>` with poster URL instead of dark placeholder
- **THEN** centered play icon overlay is added on top of the image

#### Scenario: Video without poster
- **WHEN** video `MediaItem` has no poster
- **THEN** grid card falls back to dark placeholder + play icon (current behavior)
