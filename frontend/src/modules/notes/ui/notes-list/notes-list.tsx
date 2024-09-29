import { ScrollArea, Skeleton } from "devnote/modules/shared";
import { useNotesList } from "./use-notes-list";
import { NoteItem } from "./note-item/note-item";
import { NoteItemSkeleton } from "./note-item/note-item-skeleton";

export const NotesList = () => {

	const {
		notesList,
		isLoadingNotes,
		notesError
	} = useNotesList();

	if (isLoadingNotes) {
		return (
			<div className="p-4 bg-bg-secondary h-full max-w-96 w-full">
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
		<div className="p-4 bg-bg-secondary h-full max-w-96 w-full">
			<div className="font-bold text-lg mb-3 text-gray-100">
				Notes
			</div>
			<div className="text-gray-500 mb-3 border-b border-t border-gray-600 py-1 text-sm">
				{notesList.length} notes
			</div>
			<div>
				<ScrollArea className="flex flex-col gap-4">
					{notesList.map(note => (
						<NoteItem
							key={note.id}
							note={note}/>
					))}
				</ScrollArea>
			</div>
		</div>
	);
};
