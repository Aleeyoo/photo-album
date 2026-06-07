# Photo Album

An infinite pannable masonry grid for Telegram channel media. Browse photos and videos visually, with tag-based filtering.

## Setup

Requires Node.js 20+.

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000

### Configuration

Create a `.env` file (see `.env.example`):

```
VITE_API_URL=https://tg-api.aleeyoo.workers.dev
VITE_CHANNEL=leeyoooo
```

Without `.env`, the app defaults to these values.

## Deploy to Cloudflare Pages

```bash
# Install Wrangler
npm install -g wrangler

# Build
npm run build

# Deploy
wrangler pages deploy dist/

# Set environment variables in Cloudflare dashboard:
# API_BASE_URL = https://tg-api.aleeyoo.workers.dev
# CHANNEL = leeyoooo
```

### Runtime Configuration

`API_BASE_URL` and `CHANNEL` are set in the Cloudflare Pages dashboard environment variables — no rebuild needed when changing channels.

## How it works

- Masonry positions are computed as pure data, then a fixed pool of ~500 DOM elements is recycled as you pan.
- Lightbox clones the clicked element, animates it to center with [Motion One](https://motion.dev/) springs, and loads the full image/video on top.
- Tag filtering uses the `tags` endpoint — dropdown pill in the top-right lets you filter by tag.

## API Format

Consumes [tg-api](https://github.com/aleeyoo/tele2web) endpoints:

| Endpoint | Description |
|---|---|
| `GET /api/v1/ch/{channel}/media/images` | Flattened image items |
| `GET /api/v1/ch/{channel}/media/videos` | Flattened video items |
| `GET /api/v1/ch/{channel}/tags` | Tag counts |
| `GET /api/v1/ch/{channel}/posts/{id}` | Single post detail |

## License

MIT
