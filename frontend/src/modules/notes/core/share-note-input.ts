import { NoteSharingTypeEnum } from "./enums/note-sharing-type.enum"

export type ShareNoteInput = {
	sharingType: NoteSharingTypeEnum
	sharingPassword: string | null
}
