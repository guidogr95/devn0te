import { ApiMapper } from "devnote/modules/shared/interface/mappers/api.mapper";
import { NoteEntity } from "../../core/entity/note.entity";
import { GetNoteBySharingUrlDTO } from "../../core/get-note-by-sharing-url-dto";
import { GetNoteBySharingUrlInput } from "../../core/get-note-by-sharing-url-input";
import { GetNotesReponse, NoteResponse, PaginatedNotesValueObject } from "../../core/get-notes-response";
import { NoteInput } from "../../core/note-input";
import { ShareNoteDto } from "../../core/share-note-dto";
import { ShareNoteInput } from "../../core/share-note-input";
import { UpdateNoteDto } from "../../core/update-note.dto";
import { GetNotesInput, GetNotesSortByValues } from "../../core/get-notes-input";
import { GetNotesDTO, GetNotesSortByDTOValues } from "../../core/get-notes-dto";

export class NoteMapper {

  static notesResponseToNoteEntity(input: NoteResponse[]): NoteEntity[] {

		return input.map(this.noteResponseToEntity);
  }

  static getNotesResponseToValueObject(input: GetNotesReponse): PaginatedNotesValueObject {

		return {
      data: this.notesResponseToNoteEntity(input.data),
      pagination: ApiMapper.apiPaginationResponseToValueObject(input.pagination)
    };
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

  static getNotesInputToDTO(input: GetNotesInput): GetNotesDTO {
    const dto: GetNotesDTO = {};

    if (input.pageSize) {
      dto.page_size = input.pageSize;
    }

    if (input.page) {
      dto.page = input.page;
    }

    if (input.sortBy && input.sortDirection) {
      dto.sort_by = this.getNotesSortByToDTO(input.sortBy);
      dto.sort_direction = input.sortDirection;
    }

    return dto;
  }

  static noteResponseToEntity(input: NoteResponse): NoteEntity {
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

  static getNotesSortByToDTO(sortBy: GetNotesSortByValues): GetNotesSortByDTOValues {
    if (sortBy === "createdAt") return "created_at";
    return "updated_at";
  }

}
