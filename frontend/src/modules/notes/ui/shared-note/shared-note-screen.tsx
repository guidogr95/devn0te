import { Card, CardContent } from "devnote/modules/shared";
import { AppLoader } from "devnote/modules/shared/ui/app-loader/app-loader";
import {
  SHARED_PASSWORD_MISSING_CODE,
  SHARED_PASSWORD_WRONG_CODE,
  SHARED_PRIVATE_CODE,
} from "devnote/core/constants/note-error-codes";
import { DomainErrorData } from "devnote/modules/auth/core/http-error";
import { SharedNotePasswordDialog } from "./shared-note-password-dialog/shared-note-password-dialog";
import { useSharedNoteScreen } from "./use-shared-note-screen";
import SharedNoteViewer from "./shared-note-viewer/shared-note-viewer";

type Props = {
	sharingUrl?: string
}

function renderErrorState(noteError: DomainErrorData | undefined, sharingUrl: string) {
	const code = noteError?.code;

	if (code === SHARED_PASSWORD_MISSING_CODE) {
		return <SharedNotePasswordDialog sharingUrl={sharingUrl} />;
	}

	if (code === SHARED_PASSWORD_WRONG_CODE) {
		return <SharedNotePasswordDialog sharingUrl={sharingUrl} wrongPasswordMessage="Wrong password" />;
	}

	if (code === SHARED_PRIVATE_CODE) {
		return (
			<div className="h-screen w-screen flex justify-center items-center bg-bg-primary">
				<Card className="w-96">
					<CardContent className="pt-6">
						<p className="text-center text-muted-foreground">This note is private.</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="h-screen w-screen flex justify-center items-center bg-bg-primary">
			<Card className="w-96">
				<CardContent className="pt-6">
					<p className="text-center text-muted-foreground">Note not found.</p>
				</CardContent>
			</Card>
		</div>
	);
}

export const SharedNoteScreen = ({
	sharingUrl
}: Props) => {

	const {
		isLoadingNote,
		noteError,
		note
	} = useSharedNoteScreen({ sharingUrl });

	if (!sharingUrl) {
		return (
			<div className="h-screen w-screen flex justify-center items-center bg-bg-primary">
				<Card className="w-96">
					<CardContent className="pt-6">
						<p className="text-center text-muted-foreground">Note not found.</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isLoadingNote || (!noteError && !note)) {
		return (
		<div className="h-screen w-screen flex justify-center items-center bg-bg-primary">
			<AppLoader/>
		</div>
		);
	}

	if (noteError) {
		return renderErrorState(noteError, sharingUrl);
	}

	return (
		<SharedNoteViewer note={note!} />
	);
};
