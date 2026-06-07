## Why

Two issues emerged during initial implementation:
1. **CORS**: Dev server at localhost:3000 can't fetch tg-api at workers.dev due to cross-origin restrictions — API fetch fails silently.
2. **Low contrast**: UI text in lightbox info panel and folder dropdown blends into dark background, making labels unreadable.

## What Changes

- Add Vite dev server proxy: `/api` requests route to tg-api, avoiding CORS in development
- Update `api.ts`: dev mode uses relative path `/api/v1/ch/...` through proxy; production uses absolute URL from config
- Increase lightbox link and dropdown text contrast to match original project's readability
- Ensure video placeholder cards don't affect text rendering
- **No BREAKING changes** — only fixes to existing implementation

## Capabilities

### New Capabilities
- `dev-proxy`: Vite dev server proxies `/api` to tg-api for CORS-free development

### Modified Capabilities
- `photo-album-data`: API fetch logic distinguishes dev vs production mode — relative path through Vite proxy in dev, absolute URL in production
- `photo-album-deploy`: Pages Function with explicit CORS headers on `/api/config` response

## Impact

- `vite.config.ts` — add `server.proxy` config
- `src/api.ts` — `fetchConfig()` uses relative path; `fetchPosts()` uses config's apiBaseUrl directly
- `style.css` — lightbox-link, folder-dropdown-item color values increased contrast
- No changes to JS logic, masonry, pool, renderer, or lightbox animation
