## ADDED Requirements

### Requirement: Lightbox shows post metadata
SYSTEM SHALL display `title`, `datetime`, and tags in the lightbox info panel.

#### Scenario: Lightbox shows title and date
- **WHEN** user opens a media item in lightbox
- **THEN** info panel shows `title` (truncated to 120 chars with ellipsis)
- **THEN** info panel shows `datetime` formatted as locale date string
- **THEN** info panel shows a link to the original post URL (`https://t.me/s/{channel}/{postId}`)

#### Scenario: Image lightbox has copy button
- **WHEN** lightbox shows an `image` type item
- **THEN** copy image button is visible (same clipboard-to-PNG logic as current app)

#### Scenario: Video lightbox hides copy button
- **WHEN** lightbox shows a `video` type item
- **THEN** copy image button is hidden

### Requirement: Lightbox uses absolute proxy URL for high-res image
SYSTEM SHALL use the same `proxy` URL for both grid thumbnail and lightbox full-resolution (no multi-size tiers).

#### Scenario: Lightbox loads same URL
- **WHEN** lightbox opens for an image
- **THEN** `<img>` src is set to the same absolute proxy URL used in the grid card
