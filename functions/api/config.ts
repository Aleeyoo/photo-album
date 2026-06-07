// Cloudflare Pages Function — returns API base URL from env var
// Allows changing the backend URL in Cloudflare dashboard without rebuild
export async function onRequest(context: {
  env: { API_BASE_URL?: string };
}): Promise<Response> {
  const apiBaseUrl = context.env.API_BASE_URL ?? "https://tg-api.aleeyoo.workers.dev";
  return new Response(JSON.stringify({ apiBaseUrl }), {
    headers: { "content-type": "application/json" },
  });
}
