## 1. Project Scaffolding

- [x] 1.1 Initialize Vite + TypeScript project (`npm create vite@latest`, select vanilla-ts template)
- [x] 1.2 Add `motion` npm dependency, remove non-Node dependencies
- [x] 1.3 Create `src/` directory structure (main.ts, types.ts, api.ts, masonry.ts, pool.ts, renderer.ts, lightbox.ts, filter.ts)
- [x] 1.4 Create `functions/api/config.ts` Pages Function
- [x] 1.5 Create `wrangler.toml` with Pages deployment config
- [x] 1.6 Create `.env.example` with `API_BASE_URL` and `CHANNEL` docs
- [x] 1.7 Update `index.html` to Vite entry point (script type="module", remove old tags)

## 2. Type Definitions

- [x] 2.1 Define `types.ts` with `Post`, `TextBlock`, `ImageBlock`, `VideoBlock`, `ReplyBlock`, `LinkPreviewBlock` interfaces matching tg-api response
- [x] 2.2 Define `MediaItem` interface (flattened: `type`, `src`, `width`, `height`, `title`, `tags`, `datetime`, `postId`, `blockId`, `isRound?`)
- [x] 2.3 Define `Config` interface: `{ apiBaseUrl: string, channel: string }`

## 3. API & Data Layer

- [x] 3.1 Implement `api.ts`: `fetchConfig()` calls `/api/config`, returns Config
- [x] 3.2 Implement `api.ts`: `fetchPosts(apiBaseUrl, channel)` fetches tg-api and returns raw JSON
- [x] 3.3 Implement `api.ts`: `normalizePosts(posts)` flattens posts → `MediaItem[]`, prepends apiBaseUrl to proxy paths, collects unique tags
- [x] 3.4 Implement `main.ts` entry point: loads config → fetches posts → normalizes → passes to app init

## 4. Masonry Layout

- [x] 4.1 Migrate `buildMasonryLayout()` to `masonry.ts`, operate on `MediaItem[]` instead of `BOOKMARKS_WITH_IMAGES[]`
- [x] 4.2 Update `LayoutItem` type to reference `MediaItem` instead of `bookmark`
- [x] 4.3 Export `colWidth`, `totalWidth`, `maxColHeight`, `layoutItems` for renderer

## 5. DOM Pool & Virtualized Renderer

- [x] 5.1 Migrate pool logic to `pool.ts`: `createPool()`, `acquireElement()`, `releaseElement()`
- [x] 5.2 Migrate renderer to `renderer.ts`: `renderVisibleItems()`, wrapping logic, camera animation loop
- [x] 5.3 Replace `elToBookmark` WeakMap with `elToMediaItem` for click handler
- [x] 5.4 Update pool element creation: for video MediaItems, render dark placeholder + play SVG instead of `<img>`
- [x] 5.5 Remove `twitterImageUrl()` function (no longer needed)

## 6. Lightbox with Video Support

- [x] 6.1 Migrate lightbox logic to `lightbox.ts` (open/close/copy animations)
- [x] 6.2 Update lightbox info panel: show `title`, formatted `datetime`, link to Telegram post
- [x] 6.3 Update lightbox content: `<img>` for image type, `<video>` for video type
- [x] 6.4 Implement video fallback button ("Play on Telegram") for failed video loads
- [x] 6.5 Implement pause-on-close for playing videos
- [x] 6.6 Hide copy button for video items

## 7. Tag Filter

- [x] 7.1 Migrate folder filter to `filter.ts` — rename to tag filter, same UI/behavior
- [x] 7.2 Replace `FOLDERS` data source with unique tags collected from `normalizePosts()`
- [x] 7.3 Update `applyFilter()` to filter `MediaItem[]` by tag

## 8. Style & Integration

- [x] 8.1 Update `style.css` — video card dark placeholder + play icon styling, any dark theme refinements
- [x] 8.2 Wire all modules together in `main.ts` / `app.ts`
- [x] 8.3 Verify `npm run dev` works (Vite dev server), full grid renders with tg-api data
- [x] 8.4 Verify `npm run build` produces valid static output
- [ ] 8.5 Verify `wrangler pages deploy dist/` works (dry run)

## 9. Cleanup

- [x] 9.1 Remove `server.js`, `export-bookmarks.js`, `sync-folders.js`
- [x] 9.2 Remove `bookmarks-data.json`, `folders-data.json` from git tracking (add to .gitignore if present)
- [x] 9.3 Update `README.md` with new setup instructions (Vite dev, Cloudflare deploy)
