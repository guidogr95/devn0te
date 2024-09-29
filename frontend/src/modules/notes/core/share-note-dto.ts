import { NoteSharingTypeEnum } from "./enums/note-sharing-type.enum"

export type ShareNoteDto = {
	sharing_type: NoteSharingTypeEnum
	sharing_password: string | null
}
