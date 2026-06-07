## Context

Current app is a Node.js server serving a vanilla JS masonry grid for Twitter bookmarks. Data flows via `fieldtheory-cli` → JSONL cache → `export-bookmarks.js` → `bookmarks-data.json`. The frontend is single-file `app.js` (~765 lines) with no build step.

We're converting to a TypeScript/Vite frontend consuming a Telegram channel API (`tg-api`). The API returns posts with heterogeneous blocks (image, video, text, reply, link_preview). Deploy target is Cloudflare Pages with a Pages Function to inject config at runtime.

## Goals / Non-Goals

**Goals:**
- Zero Twitter dependencies: remove fieldtheory, export-bookmarks, sync-folders, Chrome cookie decryption
- Pure frontend: no Node server needed for production (Vite dev server for development only)
- Cloudflare-native: deploy via `wrangler`, API URL set in Cloudflare dashboard env vars
- TypeScript: modular codebase with clear types
- Preserve all existing frontend capabilities: infinite pan, virtualized DOM pool, masonry layout, lightbox animation, tag filter
- Handle image AND video blocks as independent masonry items

**Non-Goals:**
- No server-side database or caching layer (API is external, frontend fetches directly)
- No SSR or hydration — entirely client-side SPA
- No progressive image loading (no multi-size tiers — single proxy URL for both grid and lightbox)

## Decisions

**1. Vite over raw tsc**

Raw `tsc` outputs ES modules that can't be `<script>`-loaded without bundling. Vite handles TS→JS bundling, dev server with HMR, and static build output for CF Pages. Minimal config overhead.

**2. Pages Function for config injection, not for API proxy**

The API (`tg-api`) is already on a workers.dev domain — no CORS issue since frontend and API are both on Cloudflare. Pages Function serves `/api/config` → `{ apiBaseUrl, channel }`. Both API URL and channel name are runtime-configurable, no rebuild needed. Frontend calls `tg-api` directly. If CORS becomes an issue later, switching to proxy is a 10-line change.

**3. Flatten posts → blocks at fetch time**

Each post can have multiple image/video blocks. We flatten into a flat `MediaItem[]` array in `api.ts`. Each item gets a composite key `postId-blockId` and carries parent metadata (`title`, `tags`, `datetime`). This keeps masonry/pool/renderer code unchanged — they still iterate flat arrays.

Mapping:

```
TG API post                          → Flat MediaItem[]
──────────────────────────────────────────────────────
post.id                              mediaItem.postId
post.title                           mediaItem.title
post.tags                            mediaItem.tags
post.datetime                        mediaItem.datetime
block.id (image/video)               mediaItem.blockId
block.width, block.height            mediaItem.width, mediaItem.height
block.proxy                          mediaItem.src (use proxy path)
block.type                           mediaItem.type ("image" | "video")
```

**4. Use proxy path (`/static/...`) as image/video source**

The API provides `src` (Telegram CDN) and `proxy` (relative `/static/...`). We use `proxy` to avoid hotlinking/blocking. Prepend `apiBaseUrl` at fetch time.

**5. Video handling in lightbox**

Current code already has video logic (muted autoplay, play-on-twitter fallback). Adapt to use video block's `proxy` as `src`. No additional streaming infrastructure needed — Telegram CDN MP4s are progressive.

**6. Keep Motion One via npm (not CDN `<script>`)**

Vite handles npm imports. `import { animate } from 'motion'` replaces `<script src="node_modules/motion/dist/motion.js">`. All `Motion.animate(...)` calls become `animate(...)`.

**7. Video cards in grid use placeholder + play button**

Video blocks have no thumbnail/poster field. Grid cards for video show a CSS-styled placeholder (proportional to width/height) with a centered play icon overlay. No `<video>` elements in the pool — keeps pool simple and performant. Video only loads when user opens the lightbox.

**8. Channel name in runtime config, not build-time**

`VITE_CHANNEL` is removed. Channel name comes from `/api/config` alongside `apiBaseUrl`. Changing channels means updating Cloudflare dashboard env var — no rebuild.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Telegram CDN geo-blocking or rate limiting | Using proxy path through tg-api worker, not direct CDN URLs |
| API format changes (new block types, removed fields) | TypeScript types in `types.ts` are single source of truth — update type, fix compilation errors |
| Large posts (9+ images) cause layout thrashing | Same DOM pool handles this — only ~500 elements exist at any time, layout is pure data |
| Video autoplay blocked on mobile | `playsInline` + `muted` attributes, same as current code |
