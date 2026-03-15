"use-client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { range } from "d3-array";
import { Routes } from "devnote/config/routing/routing";
import { HttpError, isHttpError } from "devnote/modules/auth/core/http-error";
import { NoteEntity } from "devnote/modules/notes/core/entity/note.entity";
import { NoteLinkEntity } from "devnote/modules/notes/core/get-note-links-response";
import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";
import { NotesAdapter } from "devnote/modules/notes/interface/adapters/notes.adapter";
import { selectLocalNotesList } from "devnote/modules/notes/redux/selector/query-local-notes-selectors";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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


// export const complexNodes: GraphNode[] = range(25).map((i) => ({
//   id: `${i}`,
//   label: `Node ${i}`,
// }));

// export const complexEdges = [
//   { id: "0->2", source: "0", target: "2", label: "Edge 0-2" },
//   { id: "1->3", source: "1", target: "3", label: "Edge 1-3" },
//   { id: "2->4", source: "2", target: "4", label: "Edge 2-4" },
//   { id: "3->5", source: "3", target: "5", label: "Edge 3-5" },
//   { id: "5->15", source: "5", target: "15", label: "Edge 5-15" },
//   { id: "5->7", source: "5", target: "7", label: "Edge 5-7" },
//   { id: "6->8", source: "6", target: "8", label: "Edge 6-8" },
//   { id: "7->9", source: "7", target: "9", label: "Edge 7-9" },
//   { id: "8->10", source: "8", target: "10", label: "Edge 8-10" },
//   { id: "9->11", source: "9", target: "11", label: "Edge 9-11" },
//   { id: "10->12", source: "10", target: "12", label: "Edge 10-12" },
//   { id: "11->13", source: "11", target: "13", label: "Edge 11-13" },
//   { id: "22->9", source: "22", target: "9", label: "Edge 22-9" },
//   { id: "13->15", source: "13", target: "15", label: "Edge 13-15" },
//   { id: "14->16", source: "14", target: "16", label: "Edge 14-16" },
//   { id: "15->17", source: "15", target: "17", label: "Edge 15-17" },
//   { id: "16->18", source: "16", target: "18", label: "Edge 16-18" },
//   { id: "17->19", source: "17", target: "19", label: "Edge 17-19" },
//   { id: "18->20", source: "18", target: "20", label: "Edge 18-20" },
//   { id: "19->21", source: "19", target: "21", label: "Edge 19-21" },
//   { id: "20->22", source: "20", target: "22", label: "Edge 20-22" },
//   { id: "21->23", source: "21", target: "23", label: "Edge 21-23" },
//   { id: "22->24", source: "22", target: "24", label: "Edge 22-24" },
//   { id: "23->0", source: "23", target: "0", label: "Edge 23-0" },
//   { id: "24->1", source: "24", target: "1", label: "Edge 24-1" },
//   { id: "0->3", source: "0", target: "3", label: "Edge 0-3" },
//   { id: "1->4", source: "1", target: "4", label: "Edge 1-4" },
//   { id: "2->5", source: "2", target: "5", label: "Edge 2-5" },
//   { id: "3->6", source: "3", target: "6", label: "Edge 3-6" },
//   { id: "4->7", source: "4", target: "7", label: "Edge 4-7" },
//   { id: "5->8", source: "5", target: "8", label: "Edge 5-8" },
//   { id: "6->9", source: "6", target: "9", label: "Edge 6-9" },
//   { id: "7->10", source: "7", target: "10", label: "Edge 7-10" },
//   { id: "8->11", source: "8", target: "11", label: "Edge 8-11" },
//   { id: "9->12", source: "9", target: "12", label: "Edge 9-12" },
//   { id: "10->13", source: "10", target: "13", label: "Edge 10-13" },
//   { id: "11->14", source: "11", target: "14", label: "Edge 11-14" },
//   { id: "12->15", source: "12", target: "15", label: "Edge 12-15" },
//   { id: "13->16", source: "13", target: "16", label: "Edge 13-16" },
//   { id: "14->17", source: "14", target: "17", label: "Edge 14-17" },
//   { id: "15->18", source: "15", target: "18", label: "Edge 15-18" },
// ];

// export const Outwards = () => {
//   const graphRef = useRef<GraphCanvasRef | null>(null);
//   const {
//     selections,
//     actives,
//     onNodeClick,
//     onCanvasClick,
//     onNodePointerOver,
//     onNodePointerOut,
//   } = useSelection({
//     ref: graphRef,
//     nodes: complexNodes,
//     edges: complexEdges,
//     pathHoverType: "out",
//   });

//   return (
//     <GraphCanvas
//       ref={graphRef}
//       animated={false}
//       nodes={complexNodes}
//       edges={complexEdges}
//       selections={selections}
//       actives={actives}
//       onNodePointerOver={onNodePointerOver}
//       onNodePointerOut={onNodePointerOut}
//       onCanvasClick={onCanvasClick}
//       onNodeClick={onNodeClick}
//     />
//   );
// };

type GraphProps = {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export const Graph = ({ nodes, edges }: GraphProps) => {
  // const nodes: GraphNode[] = [
  //   { id: "1", label: "1" },
  //   { id: "2", label: "2" },
  // ];

  const { handleSetActiveNoteId } = useNotesActions();
  

  const graphRef = useRef<GraphCanvasRef | null>(null);

  // This hook must run inside Canvas tree
  const { selections, actives, onNodeClick, onCanvasClick, onNodePointerOver, onNodePointerOut } =
    useSelection({
      ref: graphRef,
      nodes,
      edges,
      pathSelectionType: "out",
    });

    
  const navigate = useNavigate();


  const handleNodeClick = useCallback((data: InternalGraphNode) => {
    console.log("data:",data);

    onNodeClick?.(data);

    navigate({ to: Routes.dashboard.children.nodes.params.getWithParams({ id: data.id }) });

    // const centerLinks = Array.from(data.links.values()).map(link => link.toId);
    // const parentLinks = data.parents || [];

    // console.log("centerLinks:",centerLinks);

    // graphRef.current?.centerGraph([data.id]);
  },[navigate, onNodeClick]);

  const handleNodeDoubleClick = useCallback((data: InternalGraphNode) => {
    console.log("data:",data);

    handleSetActiveNoteId(parseInt(data.id));
  },[handleSetActiveNoteId]);

//   const treeEdges: GraphEdge[] = [
//   {
//     id: "0->1",
//     source: "n-0",
//     target: "n-1",
//     label: "Edge 0-1"
//   },
//   {
//     id: "0->2",
//     source: "n-0",
//     target: "n-2",
//     label: "Edge 0-2"
//   },
//   {
//     id: "2->3",
//     source: "n-2",
//     target: "n-3",
//     label: "Edge 2-3"
//   },
//   {
//     id: "3->4",
//     source: "n-3",
//     target: "n-4",
//     label: "Edge 3-4"
//   },
//   {
//     id: "4->0",
//     source: "n-4",
//     target: "n-0",
//     label: "Edge 4-0"
//   }
// ];

// const random = (floor: any, ceil: any) => Math.floor(Math.random() * ceil) + floor;

// const counts = [5, 100, 5843, 9992, 1000000];

// const simpleNodes: GraphNode[] =
//   range(5).map(i => ({
//     id: `n-${i}`,
//     label: `Node ${i}`
//   }));

//   console.log("these simple nodes", simpleNodes);
//   console.log("these treeEdges", treeEdges);

//   console.log("actual nodes", nodes);
//   console.log("actual edges", edges);



//   return <GraphCanvas layoutType="hierarchicalTd" nodes={simpleNodes} edges={treeEdges} />;


  return (
    <GraphCanvas
      ref={graphRef}
      // layoutType="radialOut2d"
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
};

export const NotesGraph = () => {

  const { id: activeNoteId } = Route.useParams();

  const localNotesList = useSelector(selectLocalNotesList);

  const activeNote = useMemo(() => localNotesList.find(note => note.id.toString() === activeNoteId), [activeNoteId, localNotesList]);

  console.log("activeNote:",activeNote);

  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);

  const navigate = useNavigate();

  const { mutate, isPending } = useMutation<
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
      const graphEdges: GraphEdge[] = noteLinks.map(link => ({
        source: `${link.sourceNoteId}`,
        target: `${link.targetNoteId}`,
        id: `${link.sourceNoteId} - ${link.targetNoteId}`,
        label: `${link.sourceNoteId} - ${link.targetNoteId}`
      })).filter(link => link.source !== link.target  );

      setGraphEdges(graphEdges);
    },
    onError: (_error) => {
      
    },
  });

  useEffect(() => {
    mutate();
  }, []);

  const isLoading = isPending;

  const nodes: GraphNode[] = useMemo(() => {

    return localNotesList.map(note => ({
      id: `${note.id}`,
      label: note.title
    }));

  }, [localNotesList]);

  if (isLoading || !graphEdges.length || !localNotesList.length) return (
    <h1>Loading</h1>
  );

  return (
      <div>
        {activeNote && <NotePreview note={activeNote} onClose={() => navigate({ to: Routes.dashboard.children.nodes.path })} />}
        <Graph
          nodes={nodes}
          edges={graphEdges}
        />
      </div>
  );
};
