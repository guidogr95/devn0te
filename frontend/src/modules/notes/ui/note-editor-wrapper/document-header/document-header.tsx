import { useSelector } from "react-redux";
import { DocumentHeaderOptions } from "./document-header-options/document-header-options";
import { selectActiveNote } from "devnote/modules/notes/redux/selector/notes-selectors";
import { HeaderTimeAgo } from "./header-time-ago";

export const DocumentHeader = () => {

	const activeNote = useSelector(selectActiveNote);

	return (
		<div className="px-4 py-3 md:px-8 md:py-6 bg-bg-secondary flex items-center justify-between">
			<div>
				<h2 className="font-bold text-base md:text-xl text-gray-100 mb-1 md:mb-2">Edit your post</h2>

				<HeaderTimeAgo dateString={activeNote?.updatedAt} />
			</div>

			<div>
				<DocumentHeaderOptions />
			</div>
		</div>
	);
};
