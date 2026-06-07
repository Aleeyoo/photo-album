## ADDED Requirements

### Requirement: Cursor-based pagination
SYSTEM SHALL support `before` cursor parameter for infinite scroll loading.

#### Scenario: Initial load
- **WHEN** app starts
- **THEN** system fetches `/media/images` and `/media/videos` without cursor
- **THEN** oldest item's ID is stored as the cursor for next page

#### Scenario: Load next page
- **WHEN** user scrolls within 800px of bottom
- **THEN** system calls `/media/images?before={cursor}` and `/media/videos?before={cursor}`
- **THEN** new items are appended to array, masonry layout rebuilt incrementally
- **THEN** cursor updated to oldest item from new batch
- **THEN** rendered re-positions tiles correctly

#### Scenario: No more content
- **WHEN** API returns empty array for both endpoints
- **THEN** no further fetches are made
