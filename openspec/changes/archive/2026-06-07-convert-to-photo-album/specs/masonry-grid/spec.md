## ADDED Requirements

### Requirement: Masonry layout uses flat MediaItem array
SYSTEM SHALL compute masonry positions from the flat `MediaItem[]` array instead of the original `bookmarks` array.

#### Scenario: Layout computed from flattened data
- **WHEN** `buildMasonryLayout()` runs
- **THEN** it iterates `MediaItem[]` instead of `BOOKMARKS_WITH_IMAGES[]`
- **THEN** each item's `width` / `height` (from block dimensions) is used for aspect ratio calculation
- **THEN** each item carries its `title` / `tags` / `datetime` for rendering

#### Scenario: Multiple media items from same post laid out independently
- **WHEN** a post has 9 image blocks producing 9 `MediaItem`s
- **THEN** each media item occupies its own masonry position at potentially different columns

### Requirement: Filter by tag rebuilds layout
SYSTEM SHALL support filtering the flat array by tag, rebuilding masonry layout after filtering.

#### Scenario: Filter by tag
- **WHEN** user selects tag "旅行"
- **THEN** system filters `MediaItem[]` to only items whose parent post has "旅行" in its tags
- **THEN** masonry layout is recomputed with filtered subset
- **THEN** camera resets to origin (0, 0)
