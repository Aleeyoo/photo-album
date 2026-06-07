## ADDED Requirements

### Requirement: Single post detail from API
SYSTEM SHALL fetch a single post's full content when lightbox opens.

#### Scenario: Full post in lightbox
- **WHEN** user clicks a media item in grid
- **THEN** system calls `GET /api/v1/ch/{ch}/posts/{postId}`
- **THEN** response contains full post with complete text, all reaction data
- **THEN** lightbox info panel shows complete title and reaction counts

#### Scenario: Post fetch fails
- **WHEN** detail fetch fails
- **THEN** lightbox falls back to data already available from media endpoints (title, date, src)
