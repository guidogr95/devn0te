import { ContextMenu, ContextMenuTrigger, Skeleton } from "devnote/modules/shared";
import { useNotesList } from "./use-notes-list";
import { NoteItemSkeleton } from "./note-item/note-item-skeleton";
import { InfiniteScrollArea } from "devnote/modules/shared/ui/scroll-area/infinite-scroll-area";
import { EditorFileListItem } from "./editor-file-list-item";
import { EditorFileListContextMenu } from "./editor-file-list-context-menu";
import { useState } from "react";

export const EditorFileList = () => {
	

	const {
		notesList,
		isLoadingNotes,
		notesError,
		isLoadingNotesNextPage,
		handleGetNotesListNextPage
	} = useNotesList();
	const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

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
		<ContextMenu>
			<div className="max-w-96 w-full flex flex-col overflow-hidden">
				{/* <div className="font-bold text-lg mb-3 flex justify-between">
					<span>
						Notes
					</span>
					<SpotlightSearch />
				</div> */}
				{/* <div className="text-gray-500 mb-3 border-b border-t border-gray-600 py-1 flex justify-between items-center">
					<span>{notesList.data.length} notes</span>
					<NotesListActions />
				</div> */}
				<ContextMenuTrigger>
									<div>sopmd</div>
								</ContextMenuTrigger>
				<ContextMenuTrigger>
									<div>sopmd</div>
								</ContextMenuTrigger>
				<ContextMenuTrigger>
									<div>sopmd</div>
								</ContextMenuTrigger>
				<ContextMenuTrigger>
									<div>sopmd</div>
								</ContextMenuTrigger>
				<div className="flex flex-col flex-1" >
					{/* {notesList.data.map((file) => (
								<ContextMenuTrigger
									key={file.id}
									onContextMenu={() => setSelectedNoteId(file.id)}>
									<EditorFileListItem note={file} />
								</ContextMenuTrigger>
							))} */}

					{/* <InfiniteScrollArea
						className="max-w-full block px-0 py-0"
						hasMore={notesList.pagination.pagesLeft > 0}
						isLoading={isLoadingNotesNextPage}
						onScrolledToBottom={handleGetNotesListNextPage}>
							{notesList.data.map((file) => (
								<ContextMenuTrigger
									key={file.id}
									onContextMenu={() => setSelectedNoteId(file.id)}>
									<EditorFileListItem note={file} />
								</ContextMenuTrigger>
							))}
						</InfiniteScrollArea> */}
				</div>
			</div>
			<EditorFileListContextMenu noteId={selectedNoteId} />
		</ContextMenu>
	);
};
