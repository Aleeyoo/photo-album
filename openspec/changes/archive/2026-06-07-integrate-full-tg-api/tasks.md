## 1. Types Update

- [ ] 1.1 Add `poster?: string` to `VideoBlock` interface in `types.ts`
- [ ] 1.2 Add `poster?: string` to `MediaItem` interface
- [ ] 1.3 Add new block types: `AudioBlock`, `StickerBlock`, `VideoStickerBlock`, `DocumentBlock`, `PollBlock`, `LocationBlock` to `types.ts`
- [ ] 1.4 Add `MediaApiItem` interface for `/media/images` + `/media/videos` response format

## 2. API Layer Rewrite

- [ ] 2.1 Implement `fetchMedia(apiBaseUrl, channel)` — calls `/media/images` and `/media/videos` in parallel, merges results
- [ ] 2.2 Implement `fetchTags(apiBaseUrl, channel)` — calls `/tags`, returns `{ name, count }[]`
- [ ] 2.3 Implement `fetchPostDetail(apiBaseUrl, channel, postId)` — calls `/posts/:id`
- [ ] 2.4 Remove `normalizePosts()` function and `NormalizedResult` interface
- [ ] 2.5 Remove `isDev()` and stale config fallback code (no longer needed)

## 3. Video Poster in Grid

- [ ] 3.1 Update `renderer.ts` — video items with `poster` render `<img>` with poster URL instead of dark placeholder
- [ ] 3.2 Keep play icon overlay on video cards regardless of poster availability
- [ ] 3.3 Maintain `grid-item-video` class for video card styling (CSS unchanged)

## 4. Infinite Scroll

- [ ] 4.1 Add `IntersectionObserver` in `main.ts` — observe sentinel element at grid bottom
- [ ] 4.2 Track cursor: store oldest item `postId` as `before` param
- [ ] 4.3 On threshold: call `fetchMedia()` with `before` cursor, append items, rebuild masonry, re-render
- [ ] 4.4 Add sentinel div to `index.html` or create dynamically in `main.ts`

## 5. Lightbox Post Detail

- [ ] 5.1 In `lightbox.ts`, call `fetchPostDetail()` on lightbox open
- [ ] 5.2 Fall back to existing data if detail fetch fails
- [ ] 5.3 Update info panel with rich reactions data from full post

## 6. Verify

- [ ] 6.1 Run `npm run dev` — media images load from new endpoint
- [ ] 6.2 Verify video cards show poster thumbnail
- [ ] 6.3 Scroll to bottom — infinite scroll loads more items
- [ ] 6.4 Open lightbox — post detail is fetched and shown
- [ ] 6.5 Verify tag filter works with new `/tags` endpoint data
- [ ] 6.6 Run `npm run build` — no errors
