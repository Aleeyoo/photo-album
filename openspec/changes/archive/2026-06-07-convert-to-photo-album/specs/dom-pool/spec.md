## ADDED Requirements

### Requirement: DOM pool operates on flat MediaItem data
SYSTEM SHALL maintain the existing DOM object pool mechanism, operating on `MediaItem[]` as its data source.

#### Scenario: Pool acquires elements for flat items
- **WHEN** `renderVisibleItems()` runs with `MediaItem[]`
- **THEN** pool acquires elements and assigns `MediaItem` data (image src, dimensions, title, tags)
- **THEN** `elToBookmark` WeakMap is replaced with `elToMediaItem` or equivalent mapping for click handling

#### Scenario: Pool element type detection for video
- **WHEN** a pool element is assigned a `type: "video"` MediaItem
- **THEN** element does NOT create an `<img>` — instead shows a dark placeholder (`background: #1a1a1a`)
- **THEN** element renders a centered play icon SVG overlay
- **THEN** on click, lightbox opens as video (not image)
