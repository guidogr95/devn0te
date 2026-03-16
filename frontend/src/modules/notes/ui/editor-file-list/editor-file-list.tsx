import { Skeleton } from "devnote/modules/shared";
import { useNotesList } from "./use-notes-list";
import { NoteItemSkeleton } from "./note-item/note-item-skeleton";
import { InfiniteScrollArea } from "devnote/modules/shared/ui/scroll-area/infinite-scroll-area";
import { EditorFileListItem } from "./editor-file-list-item";

export const EditorFileList = () => {
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
		<div className="max-w-96 w-full flex flex-col overflow-hidden">
			<div className="flex flex-col flex-1">
				<InfiniteScrollArea
					className="max-w-full block px-0 py-0"
					hasMore={notesList.pagination.pagesLeft > 0}
					isLoading={isLoadingNotesNextPage}
					onScrolledToBottom={handleGetNotesListNextPage}>
					{notesList.data.map((file) => (
						<EditorFileListItem key={file.id} note={file} />
					))}
				</InfiniteScrollArea>
			</div>
		</div>
	);
};
