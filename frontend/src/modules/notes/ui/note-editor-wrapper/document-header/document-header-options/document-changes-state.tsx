import { AlertTriangle, Loader2, LucideCheckCircle2 } from "lucide-react";
import { useDocumentChangesState } from "./use-document-changes-state";
import { PropsWithChildren } from "react";

export const DocumentChangesState = () => {

	const {
		isChangesUnsaved,
		isNoteUpdating,
		isNoteDeleting
	} = useDocumentChangesState();

	if (isNoteDeleting) {
		return (
			<DocumentChangeWrapper>
				<div className="flex gap-2 items-center">
					<span className="text-right font-semibold text-sm text-gray-100">Deleting</span>
					<Loader2 size={18} className="text-blue-400 animate-spin" aria-label="Deleting Note" />
				</div>
			</DocumentChangeWrapper>
		);
	}

	if (isNoteUpdating) {
		return (
			<DocumentChangeWrapper>
				<div className="flex gap-2 items-center">
					<span className="text-right font-semibold text-sm text-gray-100">Saving</span>
					<Loader2 size={18} className="text-blue-400 animate-spin" aria-label="Saving changes" />
				</div>
			</DocumentChangeWrapper>
		);
	}

	if (isChangesUnsaved && !isNoteDeleting) {
		return (
			<DocumentChangeWrapper>
				<div className="flex gap-2 items-center">
					<span className="text-right font-semibold text-sm text-gray-100">Unsaved</span>
					<AlertTriangle size={18} className="text-yellow-400 animate-pulse" aria-label="Unsaved changes" />
				</div>
			</DocumentChangeWrapper>
		);
	}

	return (
		<DocumentChangeWrapper>
			<div className="flex gap-2 items-center">
				<span className="text-right font-semibold text-sm text-gray-100">Saved</span>
				<LucideCheckCircle2 size={18} className="text-green-600" aria-label="Saving changes" />
			</div>
		</DocumentChangeWrapper>
	);
};

const DocumentChangeWrapper = ({ children }: PropsWithChildren) => {
	return (
		<div 
			className="flex items-center justify-center"
			aria-live="polite">
			{ children }
		</div>
	);
};
