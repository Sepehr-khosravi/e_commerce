export function normalizeImageUrl(url: string) {
  if (!url) return "";

  return url.startsWith("/") ? url : `/${url}`;
}