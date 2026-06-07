## Why

The frontend currently only uses `GET /posts` and reimplements flattening, tag counting, and filtering on the client side. The tg-api already provides dedicated endpoints (`/media/images`, `/media/videos`, `/tags`, `/posts/:id`, pagination) and richer block data (`poster` for videos, more block types) that the frontend ignores. This duplicates work, wastes bandwidth, and limits user experience (video cards show black placeholders instead of thumbnails, no infinite scroll, no full post details).

## What Changes

- Switch from `/posts` to `/media/images` + `/media/videos` for grid data (flat, no client-side normalize)
- Add video `poster` field → show thumbnail on grid cards instead of dark placeholder
- Add `/media/images` to `types.ts` (no need to flatten in `api.ts`)
- Add `/tags` endpoint for server-side tag list with counts
- Add `/posts/:id` endpoint for lightbox full post details
- Infinite scroll: cursor-based pagination using `before`/`after` params
- Handle additional block types: `sticker`, `video_sticker`, `audio`, `document`, `poll`, `location`, `link_preview.image`
- Remove `normalizePosts()` and `tags` client-side computation (replaced by API)
- **BREAKING**: Data source switches from `/posts` to `/media/*` — `normalizePosts` and client-side flattening removed. Tag dropdown now sourced from `/tags` endpoint
- **BREAKING**: Types updated with new block types and video `poster` field

## Capabilities

### New Capabilities
- `api-media-endpoints`: Use dedicated `/media/images`, `/media/videos` endpoints instead of client-side flattening
- `api-tag-endpoint`: Fetch tags from `/tags` endpoint with counts
- `api-post-detail`: Fetch single post from `/posts/:id` for full lightbox content
- `infinite-scroll`: Cursor-based pagination with `before`/`after` parameters, auto-load on scroll to bottom
- `video-poster`: Use `poster` field from video blocks as grid card thumbnail

### Modified Capabilities
- `photo-album-data`: Fetch strategy changes from single `/posts` call to multiple targeted API calls (`/media/*`, `/tags`, `/posts/:id`). `normalizePosts()` removed. New block types added to normalization.
- `photo-album-video`: Grid cards use `poster` thumbnail instead of dark placeholder

## Impact

- `src/types.ts` — Add new block types (AudioBlock, StickerBlock, VideoStickerBlock, DocumentBlock, PollBlock, LocationBlock). Add `poster` to VideoBlock.
- `src/api.ts` — Replace `fetchPosts()` + `normalizePosts()` with `fetchMedia()` (calls `/media/images` + `/media/videos`), `fetchTags()`, `fetchPostDetail()`. Remove client-side flattening and tag dedup.
- `src/renderer.ts` — Video cards render with `<img poster>` + play overlay
- `src/lightbox.ts` — Optional: call `fetchPostDetail()` on open for rich content
- `src/masonry.ts` — Support sticky/pinned items from `LinkPreviewBlock.image`
- `src/main.ts` — Remove stale `normalizePosts` import. Replace with `fetchMedia` + `fetchTags` initialization.
