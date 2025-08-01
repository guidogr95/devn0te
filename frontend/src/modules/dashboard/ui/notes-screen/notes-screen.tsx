import { NotesList } from "devnote/modules/notes/ui";
import { PropsWithChildren } from "react";

export const NotesScreen = ({ children }: PropsWithChildren) => {

	return (
		<div className="flex h-full w-full">
			<div className="flex w-full h-full">
				{/* <NotesList /> */}
				{children}
			</div>
		</div>
	);
};
