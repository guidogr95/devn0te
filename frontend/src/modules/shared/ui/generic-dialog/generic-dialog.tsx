import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogCancel, AlertDialogAction } from "../alert-dialog";
import { CustomChildrenDialogProps, GenericDialogProps } from "./types";
import { Button } from "../button";
import { X } from "lucide-react";

export const GenericDialog = (props: GenericDialogProps) => {

	const {
		cancelButtonLabel = "Cancel",
		okButtonLabel = "Ok",
		onOk,
		onCancel,
		hideCloseButton = true,
		hideOkButton = false,
		hideCancelButton = false,
		contentClassName
	} = props;

	if (isCustomChildrenDialog(props)) {
		return (
			<AlertDialog defaultOpen>
			<AlertDialogContent className={contentClassName}>
				<AlertDialogHeader>
					<AlertDialogTitle>{ props.title }</AlertDialogTitle>
					{props.description && (
						<AlertDialogDescription>
							{ props.description }
						</AlertDialogDescription>
					)}
					{!hideCloseButton &&  (
						<Button
							variant="ghost"
							className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
							onClick={onCancel}
						>
							<X className="h-4 w-4" />
							<span className="sr-only">Close</span>
						</Button>
					)}
				</AlertDialogHeader>

				{ props.contentSlot }

				{(!hideCancelButton || !hideOkButton) && (
					<AlertDialogFooter>
						{!hideCancelButton && (
							<AlertDialogCancel
								onClick={onCancel}>
								{ cancelButtonLabel }
							</AlertDialogCancel>
						)}
						{!hideOkButton && (
							<AlertDialogAction
								onClick={onOk}
								>{ okButtonLabel }
								</AlertDialogAction>
						)}
					</AlertDialogFooter>
				)}
			</AlertDialogContent>
			</AlertDialog>
		);
	}

	return (
	<AlertDialog defaultOpen>
		<AlertDialogContent className={contentClassName}>
			<AlertDialogHeader>
				<AlertDialogTitle>{ props.title }</AlertDialogTitle>
				{props.description && (
					<AlertDialogDescription>
						{ props.description }
					</AlertDialogDescription>
				)}
			</AlertDialogHeader>
			{(!hideCancelButton || !hideOkButton) && (
					<AlertDialogFooter>
						{!hideCancelButton && (
							<AlertDialogCancel
								onClick={onCancel}>
								{ cancelButtonLabel }
							</AlertDialogCancel>
						)}
						{!hideOkButton && (
							<AlertDialogAction
								onClick={onOk}
								>{ okButtonLabel }
								</AlertDialogAction>
						)}
					</AlertDialogFooter>
				)}
		</AlertDialogContent>
	</AlertDialog>
	);
};

function isCustomChildrenDialog(props: unknown): props is CustomChildrenDialogProps {
	return !!(props as CustomChildrenDialogProps).contentSlot;
}
