import type { Config } from "./types";

// Cloudflare Pages Function — returns runtime config from env vars
export async function onRequest(context: {
  env: { API_BASE_URL?: string; CHANNEL?: string };
}): Promise<Response> {
  const config: Config = {
    apiBaseUrl: context.env.API_BASE_URL ?? "https://tg-api.aleeyoo.workers.dev",
    channel: context.env.CHANNEL ?? "jinjinleedao",
  };

  return new Response(JSON.stringify(config), {
    headers: { "content-type": "application/json" },
  });
}
