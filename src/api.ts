import type { Config } from "./types";

export function isDev(): boolean {
  return (
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
  );
}

export async function fetchConfig(): Promise<Config> {
  const res = await fetch("/api/config");
  if (!res.ok) throw new Error(`Config fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchPosts(
  apiBaseUrl: string,
  channel: string,
  before?: string
): Promise<{ posts: any[] }> {
  const path = `/api/v1/ch/${channel}/posts`;
  const params = before ? `?before=${before}` : "";
  const url = apiBaseUrl ? `${apiBaseUrl}${path}${params}` : `${path}${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API fetch failed: ${res.status}`);
  return res.json();
}

export interface NormalizedResult {
  items: import("./types").MediaItem[];
  tags: string[];
}

function resolveSrc(block: any): string {
  return block.src;
}

function resolvePoster(block: any): string | undefined {
  if (!block.poster) return undefined;
  // poster is a proxy path like "/static/https://cdn5.telesco.pe/file/xxx.jpg"
  // extract the real CDN URL after "/static/"
  const idx = block.poster.indexOf("/static/");
  if (idx !== -1) return block.poster.slice(idx + 8);
  return block.poster;
}

export function normalizePosts(
  raw: { posts: any[] }
): NormalizedResult {
  const items: import("./types").MediaItem[] = [];
  const tagSet = new Set<string>();

  for (const post of raw.posts ?? []) {
    for (const tag of post.tags ?? []) tagSet.add(tag);

    for (const block of post.blocks ?? []) {
      if (block.type === "image" || block.type === "video") {
        const src = resolveSrc(block);
        const poster = resolvePoster(block);

        items.push({
          type: block.type,
          src,
          width: block.width ?? 1,
          height: block.height ?? 1,
          title: post.title ?? "",
          tags: post.tags ?? [],
          datetime: post.datetime ?? "",
          postId: post.id,
          blockId: block.id,
          isRound: block.isRound ?? false,
          poster,
          post,
        });
      }
    }
  }

  return { items, tags: [...tagSet].sort() };
}
