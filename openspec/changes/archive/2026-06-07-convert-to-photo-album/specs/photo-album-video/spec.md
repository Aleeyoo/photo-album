## ADDED Requirements

### Requirement: Video media items show placeholder card in grid
SYSTEM SHALL render video blocks as masonry cards with a CSS-styled placeholder (proportional to block width/height) and centered play icon. No `<img>` or `<video>` tags — pool element uses a `background` placeholder.

#### Scenario: Video card in grid
- **WHEN** a `MediaItem` has `type: "video"`
- **THEN** grid card has `background: #1a1a1a` (dark placeholder) at `width` × `height` (masonry cell size)
- **THEN** card shows a centered play icon SVG overlay to indicate it's a video
- **THEN** no `<img>` or `<video>` element is created in the pool card

### Requirement: Video plays in lightbox
SYSTEM SHALL play video content in the lightbox using a native `<video>` element.

#### Scenario: Open video in lightbox
- **WHEN** user clicks a video card
- **THEN** lightbox opens with `<video>` element
- **THEN** video is muted, autoplays, has controls (for non-GIF videos)
- **THEN** video uses `playsInline` for mobile compatibility
- **THEN** video source is the absolute `proxy` URL

#### Scenario: Video fails to load
- **WHEN** video source fails (network error, invalid format)
- **THEN** lightbox shows fallback button "Play on Telegram" that opens the original post URL in a new tab

#### Scenario: Close lightbox while video playing
- **WHEN** user closes lightbox while video is playing
- **THEN** video is paused before animation runs
