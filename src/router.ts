export function parsePath(): { channel?: string; tag?: string } {
  const parts = location.pathname.replace(/\/$/, "").split("/").filter(Boolean);

  if (parts.length === 0) return {};
  if (parts.length === 1) return { channel: decodeURIComponent(parts[0]) };
  return {
    channel: decodeURIComponent(parts[0]),
    tag: decodeURIComponent(parts[1]),
  };
}
