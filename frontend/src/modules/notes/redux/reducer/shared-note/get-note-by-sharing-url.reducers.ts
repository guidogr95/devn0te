import { PayloadAction } from "@reduxjs/toolkit";
import { NoteEntity } from "../../../core/entity/note.entity";
import { SharedNoteState } from "../../slice/shared-note.slice";
import { DomainErrorData } from "devnote/modules/auth/core/http-error";
import { GetNoteBySharingUrlInput } from "devnote/modules/notes/core/get-note-by-sharing-url-input";

export const getNoteBySharingUrlRequest = (state: SharedNoteState, _action: PayloadAction<{ sharingUrl: string, input: GetNoteBySharingUrlInput }>) => {
  state.isLoadingNote = true;
  state.noteError = undefined;
  state.note = null;
};

export const getNoteBySharingUrlSuccess = (state: SharedNoteState, action: PayloadAction<NoteEntity>) => {
  state.note = action.payload;
};

export const getNoteBySharingUrlFailure = (state: SharedNoteState, action: PayloadAction<DomainErrorData>) => {
  state.noteError = action.payload;
};

export const getNoteBySharingUrlFinalized = (state: SharedNoteState) => {
  state.isLoadingNote = false;
};
