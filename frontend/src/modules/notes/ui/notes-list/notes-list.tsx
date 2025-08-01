import { Skeleton } from "devnote/modules/shared";
import { useNotesList } from "./use-notes-list";
import { NoteItem } from "./note-item/note-item";
import { NoteItemSkeleton } from "./note-item/note-item-skeleton";
import { InfiniteScrollArea } from "devnote/modules/shared/ui/scroll-area/infinite-scroll-area";
import { NotesListActions } from "./notes-list-actions";
import { SpotlightSearch } from "../spotlight-search";

export const NotesList = () => {

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
		<div className="p-4 bg-bg-secondary h-full max-w-96 w-full flex flex-col overflow-hidden">
			<div className="font-bold text-lg mb-3 text-gray-100 flex justify-between">
				<span>
					Notes
				</span>
				<SpotlightSearch />
			</div>
			<div className="text-gray-500 mb-3 border-b border-t border-gray-600 py-1 text-sm flex justify-between items-center">
				<span>{notesList.data.length} notes</span>
				<NotesListActions />
			</div>
			<div className="flex flex-col flex-1 overflow-hidden">
				<InfiniteScrollArea
					hasMore={notesList.pagination.pagesLeft > 0}
					isLoading={isLoadingNotesNextPage}
					className="h-full w-full"
					onScrolledToBottom={handleGetNotesListNextPage}>
					{notesList.data.map(note => (
						<NoteItem
							key={note.id}
							note={note}/>
					))}
				</InfiniteScrollArea>
			</div>
		</div>
	);
};
