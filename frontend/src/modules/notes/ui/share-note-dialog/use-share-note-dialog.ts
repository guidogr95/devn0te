import { useToastActions } from "devnote/modules/shared/hooks/use-toast-actions";
import { useMemo, useRef, useState } from "react";
import { useNotesActions } from "../../hooks/use-notes-actions";
import { useSelector } from "react-redux";
import { selectIsLoadingShareNote } from "../../redux/selector/notes-selectors";
import { NoteSharingTypeEnum } from "../../core/enums/note-sharing-type.enum";
import { SubmitHandler, useForm } from "react-hook-form";
import { ShareNoteSchema, ShareNoteSchemaType } from "./share-note.schema";
import { ShareNoteInput } from "../../core/share-note-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { NoteEntity } from "../../core/entity/note.entity";
import { Routes } from "devnote/config/routing/routing";

type Props = {
	note: NoteEntity
}

export function useShareNoteDialog({ note }: Props) {

	const [copied, setCopied] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);

	const {
		showToast
	} = useToastActions();

	const { handleShareNote } = useNotesActions();

	const isLoadingShareNote = useSelector(selectIsLoadingShareNote);

	const accessNotices: Record<NoteSharingTypeEnum, string> = {
    [NoteSharingTypeEnum.PUBLIC]: "Anyone with the link can access this item.",
    [NoteSharingTypeEnum.PRIVATE]: "Only you can access this item.",
    [NoteSharingTypeEnum.PASSWORD_PROTECTED]: "Only people with the link and password can access this item.",
	};

	const shareLink = useMemo(() => 
		`${window.location.origin}${Routes.shared.params.getWithParams({ sharingUrl: note.sharingUrl })}`,
		[note.sharingUrl]
	);

  const copyLink = () => {
    if (linkRef.current) {
      linkRef.current.select();
      document.execCommand("copy");
      setCopied(true);
			showToast({
				type: "success",
				message: "The share link has been copied to your clipboard."
			});
      setTimeout(() => setCopied(false), 2000);
    }
  };

	const onShareNote: SubmitHandler<ShareNoteSchemaType> = (data: ShareNoteSchemaType) => {
		const shareNoteInput: ShareNoteInput = {
			sharingType: data.accessLevel,
			sharingPassword: data.password ?? null
		};
		handleShareNote(note.id, shareNoteInput);
	};

	const {
		register,
		watch,
		handleSubmit,
		setValue,
		formState: { errors }
	} = useForm<ShareNoteSchemaType>({
		resolver: zodResolver(ShareNoteSchema),
		defaultValues: {
			accessLevel: note.sharingType,
			password: ""
		},
		mode: "onChange"
	});

	const accessLevel = watch("accessLevel");

	return {
		handleSubmit,
		onShareNote,
		setValue,
		accessLevel,
		accessNotices,
		errors,
		register,
		shareLink,
		linkRef,
		copyLink,
		copied,
		isLoadingShareNote
	};
}
