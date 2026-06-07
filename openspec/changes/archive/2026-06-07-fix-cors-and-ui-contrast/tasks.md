## 1. Vite Dev Proxy

- [x] 1.1 Add `server.proxy` to `vite.config.ts`: proxy `/api` to `https://tg-api.aleeyoo.workers.dev`
- [x] 1.2 Update `api.ts`: detect dev mode, use relative `/api/v1/ch/...` paths for API fetch, skip `/api/config` fetch

## 2. UI Contrast

- [x] 2.1 Update `.lightbox-link` in `style.css`: set `color: #fff` with `opacity: 0.7`, hover `opacity: 1`
- [x] 2.2 Update `.folder-dropdown-item` in `style.css`: default `color: #fff` with `opacity: 0.7`, hover `opacity: 1`

## 3. Verify

- [ ] 3.1 Run `npm run dev` and confirm no CORS errors in browser console
- [ ] 3.2 Verify production build succeeds (no changes to prod behavior)
- [ ] 3.3 Verify images load correctly in dev mode (both grid and lightbox)
