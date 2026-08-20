import { DocumentChangesState } from "./document-changes-state";
import { DocumentHeaderMenu } from "./document-header-menu";

export const DocumentHeaderOptions = () => {

	return (
		<div className="flex gap-2">
			<DocumentChangesState />
			<DocumentHeaderMenu />
		</div>
	);
};
