import { Skeleton } from "devnote/modules/shared";
import { useNotesList } from "./use-notes-list";
import { NoteItem } from "./note-item/note-item";
import { NoteItemSkeleton } from "./note-item/note-item-skeleton";
import { InfiniteScrollArea } from "devnote/modules/shared/ui/scroll-area/infinite-scroll-area";
import { NotesListActions } from "./notes-list-actions";
import { SpotlightSearch } from "../spotlight-search";
import { useState } from "react";
import { File } from "lucide-react";

export const EditorFileList = () => {

	const [selectedFile, setSelectedFile] = useState(0);
	

	const {
		notesList,
		isLoadingNotes,
		notesError,
		isLoadingNotesNextPage,
		handleGetNotesListNextPage
	} = useNotesList();

	if (isLoadingNotes) {
		return (
			<div className="p-4 bg-bg-secondary h-full max-w-96 w-full flex flex-col overflow-hidden">
			<div className="font-bold text-lg mb-3 text-gray-100">
				Notes
			</div>
			<div className="text-gray-500 mb-3">
			<Skeleton className="h-5 w-full bg-bg-primary" />
			</div>
			<div>
				<div className="flex flex-col gap-4">
					<NoteItemSkeleton />
					<NoteItemSkeleton />
					<NoteItemSkeleton />
					<NoteItemSkeleton />
					<NoteItemSkeleton />
				</div>
			</div>
		</div>
		);
	}

	if (notesError || !notesList) {
		return <h2>{notesError}</h2>;
	}

	return (
		<div className="bg-bg-secondary h-full max-w-96 w-full flex flex-col overflow-hidden">
			<div className="font-bold text-lg mb-3 flex justify-between">
				<span>
					Notes
				</span>
				<SpotlightSearch />
			</div>
			<div className="text-gray-500 mb-3 border-b border-t border-gray-600 py-1 flex justify-between items-center">
				<span>{notesList.data.length} notes</span>
				<NotesListActions />
			</div>
			<div className="flex flex-col flex-1 overflow-hidden max-w-full" >
				<InfiniteScrollArea
					className="h-full max-w-full block"
					hasMore={notesList.pagination.pagesLeft > 0}
					isLoading={isLoadingNotesNextPage}
					onScrolledToBottom={handleGetNotesListNextPage}>
            <div className="p-2">
              {notesList.data.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-700 transition-colors ${
                    selectedFile === file.id ? "bg-gray-700 text-green-300" : "text-gray-400"
                  }`}
                  onClick={() => setSelectedFile(file.id)}
                >
                  <File className="w-[5%] h-4" />
                  <span className="w-[85%] text-sm truncate min-w-0">{file.title}</span>
                </div>
              ))}
            </div>
          </InfiniteScrollArea>
			</div>
		</div>
	);
};
