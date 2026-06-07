## MODIFIED Requirements

### Requirement: Fetch posts from API
REPLACED. System no longer fetches `/posts` directly. Instead fetches from `/media/images` + `/media/videos`.

### Requirement: Normalize posts to flat media items
REPLACED. No client-side normalization needed. `/media/*` endpoints return flattened items directly. `normalizePosts()` function is removed.

### Requirement: Tags mapped to filter labels
REPLACED. Tags now come from `/tags` endpoint with server-side counts. Client-side dedup removed.
