import { insertNoteLocally } from "../../../../lib/sqlite";

export function parseFrontmatter(raw: string): { connectorId: string; title: string; content: string; updatedAt: string } | null {
  const match = raw.match(/^---\n([\s\S]+?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  const fm: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!fm["connector_id"] || !uuidPattern.test(fm["connector_id"]) || !fm["title"]) return null;
  return {
    connectorId: fm["connector_id"],
    title: fm["title"],
    content: match[2] ?? "",
    updatedAt: fm["updated_at"] ?? new Date().toISOString(),
  };
}

export async function importNotes(files: File[], userId: number): Promise<{ imported: number; failed: number }> {
  let imported = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const raw = await file.text();
      const parsed = parseFrontmatter(raw);
      if (parsed) {
        await insertNoteLocally({
          connectorId: parsed.connectorId,
          userId,
          title: parsed.title,
          content: parsed.content,
          updatedAt: parsed.updatedAt,
        });
      } else {
        const title = file.name.replace(/\.md$/i, "");
        if (!title) { failed++; continue; }
        await insertNoteLocally({
          connectorId: crypto.randomUUID(),
          userId,
          title,
          content: raw,
          updatedAt: new Date().toISOString(),
        });
      }
      imported++;
    } catch {
      failed++;
    }
  }

  return { imported, failed };
}
