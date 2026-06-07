## Why

Convert the Twitter bookmark masonry grid into a universal online photo album. The current frontend is tightly coupled to Twitter data format and served by a Node.js server. We want to make it a pure frontend (TypeScript/Vite) deployable to Cloudflare Pages, consuming a generic API (`tg-api`) for photos and videos from Telegram channels — no Twitter dependencies.

## What Changes

- Replace `server.js` (Node + static files + video proxy) with Vite + TypeScript build, deploy to Cloudflare Pages
- Replace Twitter-specific data model (`bookmarks`, `folders`) with generic `posts[]` + `blocks[]` model (image, video, text, reply, link_preview)
- Each image/video block → independent masonry card (flatten post blocks into individual items)
- Replace `export-bookmarks.js` / `sync-folders.js` with runtime API fetch via Cloudflare Pages Function
- API base URL configurable via Cloudflare `env.API_BASE_URL` (no rebuild needed)
- Remove video proxy (already served by tg-api's `/static/` proxy path)
- **BREAKING**: Drop all Twitter-specific logic (fieldtheory cache parsing, Chrome cookie decryption, Twitter GraphQL queries)
- **BREAKING**: Front-end no longer works with local `bookmarks-data.json` — requires tg-api endpoint

## Capabilities

### New Capabilities
- `photo-album-data`: Fetch and normalize posts from tg-api, flatten blocks into renderable items, handle image/video types
- `photo-album-deploy`: Cloudflare Pages deployment configurable via env vars, no build-time config
- `photo-album-video`: Video playback in lightbox with muted autoplay + play-on-twitter-style fallback

### Modified Capabilities
- `masonry-grid`: Layout calculation remains same core algorithm, but input data format changes from `bookmark` → `flattenedBlock` (image/video items with `src`, `proxy`, `width`, `height`, `title`, `tags`)
- `dom-pool`: Unchanged — works generically on positioned divs
- `lightbox`: Unchanged animation logic, but content rendering adapted: show `<video>` for video blocks, `<img>` for images

## Impact

- `server.js` — removed (replaced by Vite dev server for development, Cloudflare Pages for production)
- `app.js` — rewritten as TypeScript modules: `types.ts`, `api.ts`, `app.ts`, `masonry.ts`, `pool.ts`, `renderer.ts`, `lightbox.ts`, `filter.ts`
- `style.css` — mostly unchanged, minor tweaks for video cards
- `index.html` — becomes Vite entry point (script module import, no `<script>` tag for Motion)
- `package.json` — dependencies change: add `vite`, `motion` kept; remove fieldtheory-related deps
- `export-bookmarks.js` — removed
- `sync-folders.js` — removed
- `bookmarks-data.json` — no longer used
- `folders-data.json` — no longer used
