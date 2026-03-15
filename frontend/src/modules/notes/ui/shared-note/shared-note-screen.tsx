import { AppLoader } from "devnote/modules/shared/ui/app-loader/app-loader";
import { ShareNoteErrorCodesEnum } from "../../errors/share-note.error";
import { SharedNotePasswordDialog } from "./shared-note-password-dialog/shared-note-password-dialog";
import { useSharedNoteScreen } from "./use-shared-note-screen";
import SharedNoteViewer from "./shared-note-viewer/shared-note-viewer";

type Props = {
	sharingUrl?: string
}

export const SharedNoteScreen = ({
	sharingUrl
}: Props) => {

	const {
		isLoadingNote,
		noteError,
		note
	} = useSharedNoteScreen({ sharingUrl });

	if (!sharingUrl) return null;

	if (isLoadingNote) {
		return (
		<div className="h-screen w-screen flex justify-center items-center bg-bg-primary">
			<AppLoader/>
		</div>
		);
	}

	if (noteError?.code === ShareNoteErrorCodesEnum.PROTECTED_PASSWORD_UNAUTHORIZED) {
		return (
			<SharedNotePasswordDialog sharingUrl={sharingUrl}/>
		);
	}

	if (!note) return null;

	return (
		<SharedNoteViewer note={note} />
	);
};
