import type { MediaItem } from "./types";

export async function fetchApiBaseUrl(): Promise<string> {
  try {
    const res = await fetch("/api/config");
    if (!res.ok) throw new Error(`Config fetch failed: ${res.status}`);
    const data = await res.json();
    return data.apiBaseUrl;
  } catch {
    if ((import.meta as any).env?.VITE_API_URL) {
      return (import.meta as any).env.VITE_API_URL;
    }
    throw new Error("API_BASE_URL not configured. Set API_BASE_URL env var in Cloudflare dashboard or VITE_API_URL in .env");
  }
}

export async function fetchChannels(
  apiBaseUrl: string
): Promise<string[]> {
  const res = await fetch(`${apiBaseUrl}/api/v1/ch`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.channels ?? [];
}

export async function fetchPosts(
  apiBaseUrl: string,
  channel: string,
  before?: string
): Promise<{ posts: any[] }> {
  const params = before ? `?before=${before}` : "";
  const url = `${apiBaseUrl}/api/v1/ch/${channel}/posts${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API fetch failed: ${res.status}`);
  return res.json();
}

export interface NormalizedResult {
  items: MediaItem[];
  tags: string[];
}

export function normalizePosts(raw: { posts: any[] }): NormalizedResult {
  const items: MediaItem[] = [];
  const tagSet = new Set<string>();

  for (const post of raw.posts ?? []) {
    for (const tag of post.tags ?? []) tagSet.add(tag);

    for (const block of post.blocks ?? []) {
      if (block.type === "image" || block.type === "video") {
        items.push({
          type: block.type,
          src: block.src,
          width: block.width ?? 1,
          height: block.height ?? 1,
          title: post.title ?? "",
          tags: post.tags ?? [],
          datetime: post.datetime ?? "",
          postId: post.id,
          blockId: block.id,
          isRound: block.isRound ?? false,
          poster: block.poster
            ? block.poster.replace(/^\/static\/https:\/\//, "https://")
            : undefined,
          post,
        });
      }
    }
  }

  return { items, tags: [...tagSet].sort() };
}
