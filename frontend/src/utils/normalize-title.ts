export function normalizeTitle(raw: string): string {
  let result = raw.trim();
  result = result.replace(/[^a-zA-Z0-9_-]/g, "-");
  result = result.replace(/-{2,}/g, "-");
  result = result.replace(/^-+|-+$/g, "");
  result = result.slice(0, 50);
  return result || "untitled";
}
