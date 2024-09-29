import { NoteEntity } from "../../core/entity/note.entity";
import { GetNoteBySharingUrlDTO } from "../../core/get-note-by-sharing-url-dto";
import { GetNoteBySharingUrlInput } from "../../core/get-note-by-sharing-url-input";
import { GetNotesReponse, NoteResponse } from "../../core/get-notes-response";
import { NoteInput } from "../../core/note-input";
import { ShareNoteDto } from "../../core/share-note-dto";
import { ShareNoteInput } from "../../core/share-note-input";
import { UpdateNoteDto } from "../../core/update-note.dto";

export class NoteMapper {

  static getNotesResponseToEntity(input: GetNotesReponse): NoteEntity[] {

		return input.map(this.getNoteResponseToEntity);
  }

  static shareNoteInputToDto(input: ShareNoteInput): ShareNoteDto {
    return {
      sharing_password: input.sharingPassword,
      sharing_type: input.sharingType
    };
  }

  static getNoteBySharingUrlInputToDTO(input: GetNoteBySharingUrlInput): GetNoteBySharingUrlDTO {
    return {
      sharing_password: input.sharingPassword
    };
  }

  static getNoteResponseToEntity(input: NoteResponse): NoteEntity {
    return {
      id: input.id,
      title: input.title || "",
      content: input.content || "",
      sharingType: input.sharing_type,
      sharingPassword: input.sharing_password,
      userId: input.user_id,
      createAt: input.created_at,
      updatedAt: input.updated_at,
      sharingUrl: input.sharing_url
    };
  }

  static noteInputToDto(input: NoteInput): UpdateNoteDto {
    const dto: UpdateNoteDto = {};

    if (input.content) dto.content = input.content;

    if (input.title) dto.title = input.title;

    return dto;
  }

}
