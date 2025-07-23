import { NoteEntity } from "devnote/modules/notes/core/entity/note.entity";
import { useNoteItem } from "./use-note-item";
import { Card, CardContent, CardHeader, CardTitle } from "devnote/modules/shared";
import { CalendarIcon } from "lucide-react";
import { cn } from "devnote/utils/shadcn";

import "./note-item.css";

type Props = {
	note: NoteEntity
}

export const NoteItem = ({
	note
}: Props) => {
	const {
		isActive,
		handleSetNote
	} = useNoteItem(note);

	return (
		<Card 
			key={note.id} 
			className={`overflow-hidden transition-all duration-200 ease-in-out cursor-pointer w-full bg-transparent border-transparent rounded-sm ${
				isActive 
					? "ring-2 ring-primary shadow-lg border-note-primary" 
					: "hover:shadow-md hover:bg-gray-750 border-b-gray-600"
			}`}
			onClick={handleSetNote}
		>
			<CardHeader className="px-4 py-5">
				<div className="flex justify-between items-start">
					<CardTitle className={cn("text-sm font-semibold text-gray-100 line-clamp-1 w-[65%]", { "list-item leading-9 list-transparent-disc": !note.title })}>
						{note.title}
					</CardTitle>
					<div className="flex items-center text-xs text-gray-400">
						<CalendarIcon className="w-3 h-3 mr-1" />
						{new Date(note.updatedAt).toDateString()}
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-1 pb-3 px-3">
				<span className={cn("note-content text-sm text-gray-400 line-clamp-2 [&>*]:whitespace-pre-wrap", { "inline-table": !note.content })} dangerouslySetInnerHTML={{ __html: note.content }}/>
			</CardContent>
		</Card>
	);
};
