import { describe, it, expect, vi } from "vitest";
vi.mock("../../../../lib/sqlite", () => ({
  insertNoteLocally: vi.fn().mockResolvedValue(undefined),
}));

if (typeof File.prototype.text !== "function") {
  File.prototype.text = function (): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(this);
    });
  };
}

import { parseFrontmatter, importNotes } from "./import-notes";
import { insertNoteLocally } from "../../../../lib/sqlite";

const VALID_FM = `---
connector_id: 550e8400-e29b-41d4-a716-446655440000
title: My Note
updated_at: 2025-01-01T00:00:00.000Z
---
Body content here`;

describe("parseFrontmatter", () => {
  it("parses valid frontmatter with connector_id, title, and updated_at", () => {
    const result = parseFrontmatter(VALID_FM);
    expect(result).not.toBeNull();
    expect(result!.connectorId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result!.title).toBe("My Note");
    expect(result!.content).toBe("Body content here");
    expect(result!.updatedAt).toBe("2025-01-01T00:00:00.000Z");
  });

  it("returns null when connector_id is missing", () => {
    const raw = `---
title: My Note
---
Body`;
    expect(parseFrontmatter(raw)).toBeNull();
  });

  it("returns null when connector_id is not a valid UUID", () => {
    const raw = `---
connector_id: not-a-uuid
title: My Note
---
Body`;
    expect(parseFrontmatter(raw)).toBeNull();
  });

  it("returns null when title is missing", () => {
    const raw = `---
connector_id: 550e8400-e29b-41d4-a716-446655440000
---
Body`;
    expect(parseFrontmatter(raw)).toBeNull();
  });
});

describe("importNotes plain-.md D1 branch", () => {
  it("falls through to filename-stem title for plain .md without frontmatter", async () => {
    const file = new File(["some content"], "notes.md", { type: "text/markdown" });
    const result = await importNotes([file], 1);
    expect(result.imported).toBe(1);
    expect(result.failed).toBe(0);
    expect(insertNoteLocally).toHaveBeenCalledWith(
      expect.objectContaining({ title: "notes" })
    );
  });

  it("counts empty-stem .md (literal filename) as failed", async () => {
    const file = new File(["content"], ".md", { type: "text/markdown" });
    const result = await importNotes([file], 1);
    expect(result.imported).toBe(0);
    expect(result.failed).toBe(1);
  });
});
