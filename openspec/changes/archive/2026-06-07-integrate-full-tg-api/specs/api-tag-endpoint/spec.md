## ADDED Requirements

### Requirement: Tags fetched from API
SYSTEM SHALL fetch tag counts from `/tags` endpoint.

#### Scenario: Tags endpoint called
- **WHEN** app initializes
- **THEN** system calls `GET /api/v1/ch/{ch}/tags`
- **THEN** response `{ tags: [{ name, count }] }` used for filter dropdown
- **THEN** tags shown as `name (count)` in dropdown
