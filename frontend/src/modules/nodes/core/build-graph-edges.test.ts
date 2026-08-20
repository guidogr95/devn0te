import { describe, it, expect, vi } from "vitest";
vi.mock("reagraph", () => ({
  GraphEdge: {},
}));

import { buildGraphEdges } from "./graph-edges";
import { NoteLinkEntity } from "devnote/modules/notes/core/get-note-links-response";
import { LocalNoteEntity } from "devnote/modules/notes/core/entity/local-note-entity";

const localNotes: LocalNoteEntity[] = [
  { id: 1, connectorId: "conn-a", title: "Note A", userId: 1, updatedAt: "", content: "", searchableText: "" },
  { id: 2, connectorId: "conn-b", title: "Note B", userId: 1, updatedAt: "", content: "", searchableText: "" },
];

describe("buildGraphEdges", () => {
  it("retains edges where both connector IDs map to local notes", () => {
    const links: NoteLinkEntity[] = [
      { id: 1, createdAt: "", updatedAt: "", sourceConnectorId: "conn-a", targetConnectorId: "conn-b" },
    ];
    const edges = buildGraphEdges(links, localNotes);
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe("1");
    expect(edges[0].target).toBe("2");
    expect(edges[0].id).toBe("1 - 2");
  });

  it("drops edges where either connector ID is unmapped", () => {
    const links: NoteLinkEntity[] = [
      { id: 1, createdAt: "", updatedAt: "", sourceConnectorId: "conn-a", targetConnectorId: "conn-unknown" },
    ];
    const edges = buildGraphEdges(links, localNotes);
    expect(edges).toHaveLength(0);
  });

  it("drops all edges when localNotesList is empty", () => {
    const links: NoteLinkEntity[] = [
      { id: 1, createdAt: "", updatedAt: "", sourceConnectorId: "conn-a", targetConnectorId: "conn-b" },
    ];
    const edges = buildGraphEdges(links, []);
    expect(edges).toHaveLength(0);
  });
});
