import { ReactNode } from "react";

type BaseDialogProps = {
	cancelButtonLabel?: string
	okButtonLabel?: string
	onOk?: () => void
	onCancel?: () => void
	hideCloseButton?: boolean
	hideOkButton?: boolean
	hideCancelButton?: boolean
	contentClassName?: string
	description?: string
}

export type SimpleDialogProps = BaseDialogProps & {
	title: string
};

export type CustomChildrenDialogProps = BaseDialogProps & {
	contentSlot: ReactNode
	title: string
};

export type GenericDialogProps = SimpleDialogProps | CustomChildrenDialogProps;
