import { GraphEdge } from "reagraph";
import { LocalNoteEntity } from "devnote/modules/notes/core/entity/local-note-entity";
import { NoteLinkEntity } from "devnote/modules/notes/core/get-note-links-response";

export function buildGraphEdges(noteLinks: NoteLinkEntity[], localNotesList: LocalNoteEntity[]): GraphEdge[] {
  const idByConnectorId = new Map<string, string>();
  for (const note of localNotesList) {
    idByConnectorId.set(note.connectorId, `${note.id}`);
  }

  return noteLinks
    .map(link => {
      const sourceId = link.sourceConnectorId ? idByConnectorId.get(link.sourceConnectorId) : undefined;
      const targetId = link.targetConnectorId ? idByConnectorId.get(link.targetConnectorId) : undefined;
      if (!sourceId || !targetId) return null;
      return {
        source: sourceId,
        target: targetId,
        id: `${sourceId} - ${targetId}`,
      };
    })
    .filter((edge): edge is GraphEdge => edge !== null && edge.source !== edge.target);
}
