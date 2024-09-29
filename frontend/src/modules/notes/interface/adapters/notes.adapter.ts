import axiosInstance from "devnote/config/api/axios-instance";
import { HttpError } from "devnote/modules/auth/core/http-error";
import { handleApiRequest } from "devnote/utils/handle-api-request";
import { CreateNoteInput } from "../../core/create-note-input";
import { GetNotesReponse, NoteResponse } from "../../core/get-notes-response";
import { NoteEntity } from "../../core/entity/note.entity";
import { NoteMapper } from "../mappers/notes.mapper";
import { UpdateNoteInput } from "../../core/update-note-input";
import { AxiosRequestConfig } from "axios";
import { ShareNoteInput } from "../../core/share-note-input";
import { GetNoteBySharingUrlInput } from "../../core/get-note-by-sharing-url-input";

export class NotesAdapter {
  static async createNote(input: CreateNoteInput): Promise<NoteEntity | HttpError> {

    const body = NoteMapper.noteInputToDto(input);

		return handleApiRequest(() =>
      axiosInstance.post<NoteResponse>("/notes", body)
        .then(response => NoteMapper.getNoteResponseToEntity(response.data))
    );
  }

  static async deleteNoteById(id: number): Promise<NoteEntity | HttpError> {

		return handleApiRequest(() =>
      axiosInstance.delete<NoteResponse>(`/notes/${id}`)
        .then(response => NoteMapper.getNoteResponseToEntity(response.data))
    );
  }

  static async updateNoteById({ title, content, id }: UpdateNoteInput, config?: AxiosRequestConfig): Promise<NoteEntity | HttpError> {

    const body = NoteMapper.noteInputToDto({ title, content });

		return handleApiRequest(() =>
      axiosInstance.patch<NoteResponse>(`/notes/${id}`, body, { signal: config?.signal })
        .then(response => NoteMapper.getNoteResponseToEntity(response.data))
    );
  }

  static async getNotes(): Promise<NoteEntity[] | HttpError> {

		return handleApiRequest(() =>
      axiosInstance.get<GetNotesReponse>("/notes")
        .then(response => NoteMapper.getNotesResponseToEntity(response.data))
    );
  }

  static async getNoteById(noteId: number): Promise<NoteEntity | HttpError> {

		return handleApiRequest(() =>
      axiosInstance.get<NoteResponse>(`/note/${noteId}`)
        .then(response => NoteMapper.getNoteResponseToEntity(response.data))
    );
  }

  static async shareNote(noteId: number, shareNoteInput: ShareNoteInput): Promise<NoteEntity | HttpError> {

    const body =  NoteMapper.shareNoteInputToDto(shareNoteInput);

		return handleApiRequest(() =>
      axiosInstance.post<NoteResponse>(`/notes/${noteId}/share`, body)
        .then(response => NoteMapper.getNoteResponseToEntity(response.data))
    );
  }

  static async getNoteBySharingUrl(sharingUrl: string, input: GetNoteBySharingUrlInput): Promise<NoteEntity | HttpError> {

    const params = NoteMapper.getNoteBySharingUrlInputToDTO(input);
    
		return handleApiRequest(() =>
      axiosInstance.get<NoteResponse>(`/shared-notes/${sharingUrl}`, { params })
        .then(response => NoteMapper.getNoteResponseToEntity(response.data))
    );
  }

}
