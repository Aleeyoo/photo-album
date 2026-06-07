## Context

Current frontend fetches `GET /posts` for all data, then client-side flattens blocks into `MediaItem[]`. The tg-api provides optimized endpoints that do this server-side. Video blocks include a `poster` field but it's ignored — grid cards show dark placeholder. No pagination exists.

This design switches to a multi-endpoint strategy that leverages tg-api capabilities natively.

## Goals / Non-Goals

**Goals:**
- Remove client-side block flattening — use `/media/images` + `/media/videos`
- Show video thumbnails from `poster` field
- Infinite scroll with cursor-based pagination
- Tag list from `/tags` endpoint with counts
- Support all block types in types

**Non-Goals:**
- No changes to masonry layout, DOM pool, or animation
- No redesign of lightbox — only data source changes
- No backend changes (tg-api already supports everything)

## Decisions

**1. Fetch media from two endpoints instead of one**

Deviation from current single-fetch approach:
- `fetchMedia()` calls both `/media/images` and `/media/videos` in parallel (Promise.all)
- Returns a single merged, time-sorted `MediaItem[]`
- No client-side `normalizePosts()` needed

**2. Video poster as grid thumbnail**

Current video cards show `background: #1a1a1a`. Change to:
- Set `poster` as img src on video grid items
- Keep play-icon overlay
- Fall back to dark placeholder if no poster

**3. Infinite scroll via IntersectionObserver**

- Initial load: fetch first page (no `before`/`after`)
- Track oldest post ID as cursor
- When user nears bottom: `fetchMedia({ before: oldestId })`
- Append to existing `MediaItem[]`, rebuild masonry, re-render

**4. Tag list from API**

- `fetchTags()` calls `/tags`
- Replace client-side `tagSet` with server response
- Tag pill shows `name (count)` format

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| `/media/images`+`/media/videos` returns more data than needed | Both endpoints are cached by KV+LRU — no extra cost after first hit |
| Video without poster falls back to dark | Already have placeholder CSS — graceful degredation |
| Infinite scroll + masonry rebuild causes jank | Rebuild layout only on new items, no full pool reset |
