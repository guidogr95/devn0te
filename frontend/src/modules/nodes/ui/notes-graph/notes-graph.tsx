"use-client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Routes } from "devnote/config/routing/routing";
import { HttpError, isHttpError } from "devnote/modules/auth/core/http-error";
import { NoteLinkEntity } from "devnote/modules/notes/core/get-note-links-response";
import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";
import { NotesAdapter } from "devnote/modules/notes/interface/adapters/notes.adapter";
import { selectIsLoadingLocalNoteList, selectLocalNotesList } from "devnote/modules/notes/redux/selector/query-local-notes-selectors";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildGraphEdges } from "devnote/modules/nodes/core/graph-edges";
import { useSelector } from "react-redux";

import {
  GraphCanvas,
  GraphCanvasRef,
  GraphNode,
  useSelection,
  darkTheme,
  GraphEdge,
  InternalGraphNode,
} from "reagraph";
import { NotePreview } from "../note-preview";
import { Route } from "devnote/routes/dashboard/nodes/{-$id}.lazy";


type GraphProps = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  activeNoteId?: string
}

export const Graph = memo(({ nodes, edges, activeNoteId }: GraphProps) => {
  const { handleSetActiveNoteId } = useNotesActions();

  const graphRef = useRef<GraphCanvasRef | null>(null);

  // This hook must run inside Canvas tree
  const { selections, actives, onNodeClick, onCanvasClick, onNodePointerOver, onNodePointerOut, setSelections } =
    useSelection({
      ref: graphRef,
      nodes,
      edges,
      pathSelectionType: "out",
    });

  const handleSetActiveNoteIdRef = useRef(handleSetActiveNoteId);
  handleSetActiveNoteIdRef.current = handleSetActiveNoteId;

  const onNodeClickRef = useRef(onNodeClick);
  onNodeClickRef.current = onNodeClick;

  useEffect(() => {
    if (!activeNoteId) return;
    const timer = setTimeout(() => {
      setSelections([activeNoteId]);
      graphRef.current?.centerGraph([activeNoteId]);
    }, 0);
    return () => clearTimeout(timer);
  }, [activeNoteId]);

  const navigate = useNavigate();

  const handleNodeClick = useCallback((data: InternalGraphNode) => {

    onNodeClickRef.current?.(data);

    navigate({ to: Routes.dashboard.children.nodes.params.getWithParams({ id: data.id }) });
  },[navigate]);

  const handleNodeDoubleClick = useCallback((data: InternalGraphNode) => {

    handleSetActiveNoteIdRef.current(parseInt(data.id));
  },[]);

  return (
    <GraphCanvas
      ref={graphRef}
      nodes={nodes}
      edges={edges}
      theme={darkTheme}
      selections={selections}
      actives={actives}
      onNodeClick={handleNodeClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      onCanvasClick={onCanvasClick}
      onNodePointerOver={onNodePointerOver}
      onNodePointerOut={onNodePointerOut}
    />
  );
});

export const NotesGraph = () => {

  const { id: activeNoteId } = Route.useParams();

  const localNotesList = useSelector(selectLocalNotesList);
  const isLoadingLocalNoteList = useSelector(selectIsLoadingLocalNoteList);

  const activeNote = useMemo(() => localNotesList.find(note => note.id.toString() === activeNoteId), [activeNoteId, localNotesList]);

  const [noteLinks, setNoteLinks] = useState<NoteLinkEntity[]>([]);

  const graphEdges = useMemo(() => buildGraphEdges(noteLinks, localNotesList), [noteLinks, localNotesList]);

  const navigate = useNavigate();
  const { handleDeleteNoteById } = useNotesActions();

  const { mutate } = useMutation<
    Array<NoteLinkEntity>,
    HttpError,
    void
  >({
    mutationFn: async () => {
      const response = await NotesAdapter.getNoteLinks();

      if (isHttpError(response)) {
        throw response;
      }

      return response;
    },
    onSuccess: (noteLinks) => {
      setNoteLinks(noteLinks);
    },
    onError: (_error) => {},
  });

  useEffect(() => {
    mutate();
  }, []);

  const nodes: GraphNode[] = useMemo(() => {

    return localNotesList.map(note => ({
      id: `${note.id}`,
      label: note.title
    }));

  }, [localNotesList]);

  if (isLoadingLocalNoteList && !localNotesList.length) return <h1>Loading…</h1>;
  if (!localNotesList.length) return <h1>No notes yet</h1>;

  return (
      <div>
        {activeNote && (
          <NotePreview
            note={activeNote}
            edges={graphEdges}
            onClose={() => navigate({ to: "/dashboard/nodes/{-$id}" })}
            onDelete={() => {
              handleDeleteNoteById(activeNote.id);
              navigate({ to: "/dashboard/nodes/{-$id}" });
            }}
          />
        )}
        <Graph
          nodes={nodes}
          edges={graphEdges}
          activeNoteId={activeNoteId}
        />
      </div>
  );
};
