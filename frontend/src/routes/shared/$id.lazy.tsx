import { createLazyFileRoute, useParams } from "@tanstack/react-router";
import { SharedNoteScreen } from "devnote/modules/notes/ui";

export const Route = createLazyFileRoute("/shared/$id")({
  component: Index,
});

function Index() {

  const sharingUrl = useParams({
    select: (params) => params?.id ?? undefined,
		strict: false
	});

  return (
    <SharedNoteScreen sharingUrl={sharingUrl} />
  );
}
