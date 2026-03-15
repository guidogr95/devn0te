import axiosInstance from "devnote/config/api/axios-instance";
import { HttpError } from "devnote/modules/auth/core/http-error";
import { handleApiRequest } from "devnote/utils/handle-api-request";
import { CreateNoteInput } from "../../core/create-note-input";
import { GetNotesReponse, NoteResponse, PaginatedNotesValueObject } from "../../core/get-notes-response";
import { NoteEntity } from "../../core/entity/note.entity";
import { NoteMapper } from "../mappers/notes.mapper";
import { UpdateNoteInput } from "../../core/update-note-input";
import { AxiosRequestConfig } from "axios";
import { ShareNoteInput } from "../../core/share-note-input";
import { GetNoteBySharingUrlInput } from "../../core/get-note-by-sharing-url-input";
import { GetNotesInput } from "../../core/get-notes-input";
import { GetNotesForSyncResponse } from "../../core/get-notes-for-sync-response";
import { SyncNoteEntity } from "../../core/entity/sync-note.entity";
import { GetDeltaNotesResponse } from "../../core/get-delta-notes-response";
import { GetDeltaNotesValueObject } from "../../core/get-delta-notes-value-object";
import { GetNoteErrorMapper } from "../mappers/get-note-error.mapper";
import { GetNotesPreviewReponse, PaginatedNotesPreviewValueObject } from "../../core/get-notes-preview-response";
import { GetNoteLinksResponse, NoteLinkEntity } from "../../core/get-note-links-response";

export class NotesAdapter {
  static async createNote(input: CreateNoteInput): Promise<NoteEntity | HttpError> {

    const body = NoteMapper.noteInputToDto(input);

		return handleApiRequest(() =>
      axiosInstance.post<NoteResponse>("/notes", body)
        .then(response => NoteMapper.noteResponseToEntity(response.data))
    );
  }

  /**
   * 
   * @param lastSync ISOString
   * @returns 
   */
  static async getDeltaNotes(lastSync?: string | null): Promise<GetDeltaNotesValueObject | HttpError> {

    const params = lastSync 
      ? { "last_sync": lastSync } : {};

		return handleApiRequest(() =>
      axiosInstance.get<GetDeltaNotesResponse>("/user/notes/delta", { params })
        .then(response => 
          NoteMapper.getDeltaNotesResponseToValueObject(response.data)
        )
    );
  }

  /**
   * 
   * @param lastSync ISOString
   * @returns 
   */
  static async getNotesForSync(lastSync: string): Promise<SyncNoteEntity[] | HttpError> {

    const params = lastSync 
      ? { "last_sync": lastSync } : {};

		return handleApiRequest(() =>
      axiosInstance.get<GetNotesForSyncResponse>("/user/notes/sync", { params })
        .then(response => 
          response.data.notes.map(NoteMapper.syncNoteResponseToEntity)
        )
    );
  }

  static async deleteNoteById(id: number): Promise<NoteEntity | HttpError> {

		return handleApiRequest(() =>
      axiosInstance.delete<NoteResponse>(`/notes/${id}`)
        .then(response => NoteMapper.noteResponseToEntity(response.data))
    );
  }

  static async updateNoteById({ content, id }: UpdateNoteInput, config?: AxiosRequestConfig): Promise<NoteEntity | HttpError> {

    const body = NoteMapper.noteInputToDto({ content });

		return handleApiRequest(() =>
      axiosInstance.patch<NoteResponse>(`/notes/${id}`, body, { signal: config?.signal })
        .then(response => NoteMapper.noteResponseToEntity(response.data))
    );
  }

  static async getNotes(input?: GetNotesInput): Promise<PaginatedNotesValueObject | HttpError> {

    const params = input ? NoteMapper.getNotesInputToDTO(input) : {};

		return handleApiRequest(() =>
      axiosInstance.get<GetNotesReponse>("/notes", { params })
        .then(response => NoteMapper.getNotesResponseToValueObject(response.data))
    );
  }

  static async getNotesPreview(input?: GetNotesInput): Promise<PaginatedNotesPreviewValueObject | HttpError> {

    const params = input ? NoteMapper.getNotesInputToDTO(input) : {};

		return handleApiRequest(() =>
      axiosInstance.get<GetNotesPreviewReponse>("user/notes/preview", { params })
        .then(response => NoteMapper.getNotesPreviewResponseToValueObject(response.data))
    );
  }

  static async getNoteById(noteId: number) {

		return handleApiRequest(
      () =>
        axiosInstance.get<NoteResponse>(`/note/${noteId}`)
          .then(response => NoteMapper.noteResponseToEntity(response.data)),
      (err) => GetNoteErrorMapper.httpErrorToNoteError(err, noteId)
    );
  }

  static async shareNote(noteId: number, shareNoteInput: ShareNoteInput): Promise<NoteEntity | HttpError> {

    const body =  NoteMapper.shareNoteInputToDto(shareNoteInput);

		return handleApiRequest(() =>
      axiosInstance.post<NoteResponse>(`/notes/${noteId}/share`, body)
        .then(response => NoteMapper.noteResponseToEntity(response.data))
    );
  }

  static async getNoteBySharingUrl(sharingUrl: string, input: GetNoteBySharingUrlInput): Promise<NoteEntity | HttpError> {

    const params = NoteMapper.getNoteBySharingUrlInputToDTO(input);
    
		return handleApiRequest(() =>
      axiosInstance.get<NoteResponse>(`/shared-notes/${sharingUrl}`, { params })
        .then(response => NoteMapper.noteResponseToEntity(response.data))
    );
  }

  static async getNoteLinks(): Promise<NoteLinkEntity[] | HttpError> {

		return handleApiRequest(() =>
      axiosInstance.get<GetNoteLinksResponse>("/user/notes/links")
        .then(response => response.data)
    );
  }

}
