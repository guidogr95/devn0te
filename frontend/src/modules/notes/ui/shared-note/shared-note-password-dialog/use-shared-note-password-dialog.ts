import { useSharedNoteActions } from "devnote/modules/notes/hooks/use-shared-note-actions";
import { SubmitHandler, useForm } from "react-hook-form";
import { SharedNotePasswordDialogSchema, SharedNotePasswordDialogSchemaType } from "./shared-note-password-dialog.schema";
import { GetNoteBySharingUrlInput } from "devnote/modules/notes/core/get-note-by-sharing-url-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";

type Props = {
  sharingUrl: string
}

export function useSharedNotePasswordDialog({
	sharingUrl
}: Props) {

	const {
    handleGetNoteBySharingUrl
  } = useSharedNoteActions();

  const onSubmitPassword: SubmitHandler<SharedNotePasswordDialogSchemaType> = useCallback(
		(data: SharedNotePasswordDialogSchemaType) => {
			const input: GetNoteBySharingUrlInput = {
				sharingPassword: data.password ?? null
			};
			handleGetNoteBySharingUrl(sharingUrl, input);
	}, [handleGetNoteBySharingUrl, sharingUrl]);

  const {
		register,
		formState: { errors },
    handleSubmit
	} = useForm<SharedNotePasswordDialogSchemaType>({
		resolver: zodResolver(SharedNotePasswordDialogSchema),
		defaultValues: {
			password: ""
		}
	});

	return {
		handleSubmit,
		errors,
		register,
		onSubmitPassword
	};
}
