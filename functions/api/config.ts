// Cloudflare Pages Function — returns API base URL from env var
// Allows changing the backend URL in Cloudflare dashboard without rebuild
export async function onRequest(context: {
  env: { API_BASE_URL?: string };
}): Promise<Response> {
  const apiBaseUrl = context.env.API_BASE_URL;
  if (!apiBaseUrl) {
    return new Response(JSON.stringify({ error: "API_BASE_URL not configured" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ apiBaseUrl }), {
    headers: { "content-type": "application/json" },
  });
}
