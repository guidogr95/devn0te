import { NoteEditorEmpty } from "./note-editor-empty";
import { AppLoader } from "devnote/modules/shared/ui/app-loader/app-loader";
import { NoteEditor } from "./note-editor/note-editor";
import { useNoteEditorWrapper } from "./use-note-editor-wrapper";
import { DocumentHeader } from "./document-header/document-header";

export const NoteEditorWrapper = () => {

	const {
		isLoadingActiveNote,
		activeNote,
		activeNoteError
	} = useNoteEditorWrapper();

	if (isLoadingActiveNote) {
		return (
			<div className="w-full bg-bg-primary">
				<AppLoader/>
			</div>
		);
	}

	if (!activeNote || activeNoteError) {
		return <NoteEditorEmpty/>;
	}

	return (
		<div className="w-full bg-bg-primary flex flex-col max-h-screen overflow-hidden">
			<div className="border-l border-b border-bg-primary">
				<DocumentHeader />
			</div>
			<div className="flex-1 p-8 overflow-hidden">
				<NoteEditor note={activeNote} />
			</div>
		</div>
	);
};
