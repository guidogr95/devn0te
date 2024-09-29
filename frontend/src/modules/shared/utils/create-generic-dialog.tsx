import { GenericDialog } from "devnote/modules/shared";
import { GenericDialogProps } from "devnote/modules/shared/ui/generic-dialog/types";

export function createGenericDialog(props: GenericDialogProps) {
	return <GenericDialog {...props} />;
};
