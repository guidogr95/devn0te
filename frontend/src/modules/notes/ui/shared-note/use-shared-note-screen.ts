import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectIsLoadingNote, selectNote, selectNoteError } from "../../redux/selector/shared-note.selectors";
import { useSharedNoteActions } from "../../hooks/use-shared-note-actions";

type Props = {
	sharingUrl?: string
}

export function useSharedNoteScreen({
	sharingUrl
}: Props) {

	const {
		handleGetNoteBySharingUrl
	} = useSharedNoteActions();

	const isLoadingNote = useSelector(selectIsLoadingNote);
	const noteError = useSelector(selectNoteError);
	const note = useSelector(selectNote);

	useEffect(() => {
		if (!sharingUrl) return;
		handleGetNoteBySharingUrl(sharingUrl, { sharingPassword: null });
	}, []);

	return {
		isLoadingNote,
		noteError,
		note
	};
}
