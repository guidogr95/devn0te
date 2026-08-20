import { zipSync, strToU8 } from "fflate";
import { getAllNotesForExport } from "../../../../lib/sqlite";

export async function exportNotes(userId: number): Promise<void> {
  const notes = await getAllNotesForExport({ userId });

  const files: Record<string, Uint8Array> = {};
  for (const note of notes) {
    const content = `---\nconnector_id: ${note.connectorId}\ntitle: ${note.title}\nupdated_at: ${note.updatedAt}\n---\n${note.content ?? ""}`;
    const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || note.connectorId;
    const filename = `${note.connectorId}-${slug}.md`;
    files[filename] = strToU8(content);
  }

  const zipped = zipSync(files);
  const blob = new Blob([new Uint8Array(zipped)], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `devnote-export-${new Date().toISOString().slice(0, 10)}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
