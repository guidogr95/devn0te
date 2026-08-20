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
import { SyncNoteResponse } from "../../core/get-notes-for-sync-response";
import { SyncNoteEntity } from "../../core/entity/sync-note.entity";
import { GetDeltaNotesResponse } from "../../core/get-delta-notes-response";
import { GetDeltaNotesValueObject } from "../../core/get-delta-notes-value-object";
import { GetNotesPreviewReponse, NotePreviewResponse, PaginatedNotesPreviewValueObject } from "../../core/get-notes-preview-response";
import { NotePreviewEntity } from "../../core/entity/note-preview.entity";

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

  static getNotesPreviewResponseToValueObject(input: GetNotesPreviewReponse): PaginatedNotesPreviewValueObject {

		return {
      data: input.data.map(this.notePreviewResponseToEntity),
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

  static syncNoteResponseToEntity(input: SyncNoteResponse): SyncNoteEntity {
    return {
      id: input.id,
      connectorId: input.connector_id,
      title: input.title || "",
      content: input.content || "",
      userId: input.user_id,
      updatedAt: input.updated_at,
    };
  }

  static noteResponseToEntity(input: NoteResponse): NoteEntity {
    return {
      id: input.id,
      connectorId: input.connector_id,
      title: input.title || "",
      content: input.content || "",
      sharingType: input.sharing_type,
      userId: input.user_id,
      createAt: input.created_at,
      updatedAt: input.updated_at,
      sharingUrl: input.sharing_url
    };
  }

  static notePreviewResponseToEntity(input: NotePreviewResponse): NotePreviewEntity {
    return {
      id: input.id,
      title: input.title || "",
      userId: input.user_id,
      createAt: input.created_at,
      updatedAt: input.updated_at,
      preview: input.preview
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

  static getDeltaNotesResponseToValueObject(response: GetDeltaNotesResponse): GetDeltaNotesValueObject {
    return {
      ...response,
      notes: response.notes.map(NoteMapper.syncNoteResponseToEntity)
    };
  }
   

}
