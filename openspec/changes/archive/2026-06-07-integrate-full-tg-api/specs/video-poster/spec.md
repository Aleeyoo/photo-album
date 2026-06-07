## ADDED Requirements

### Requirement: Video poster as grid thumbnail
SYSTEM SHALL use the `poster` field as the grid card thumbnail for video items.

#### Scenario: Poster available
- **WHEN** video block has `poster` field
- **THEN** `poster` URL is stored in `MediaItem.poster`
- **THEN** grid card renders `<img src="{poster}">` with play overlay
- **THEN** card has same border-radius and hover effect as image cards

#### Scenario: No poster
- **WHEN** video block has no `poster` field
- **THEN** grid card falls back to dark placeholder + play icon
