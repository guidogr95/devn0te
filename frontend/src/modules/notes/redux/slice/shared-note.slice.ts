import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NoteEntity } from "../../core/entity/note.entity";
import * as getNoteBySharingUrlReducers from "../reducer/shared-note/get-note-by-sharing-url.reducers";
import { DomainErrorData } from "devnote/modules/auth/core/http-error";

export type SharedNoteState = {
  note: NoteEntity | null
  isLoadingNote: boolean
  noteError?: DomainErrorData
}

const initialState: SharedNoteState = {
  note: null,
  isLoadingNote: false,
  noteError: undefined
};

const sharedNoteSlice = createSlice({
  name: "sharedNote",
  initialState,
  reducers: {
    // Get note by sharing url
    ...getNoteBySharingUrlReducers,
    setIsLoadingNote(state, action: PayloadAction<boolean>) {
      state.isLoadingNote = action.payload;
    },
  },
});

export const sharedNoteActions = sharedNoteSlice.actions;

export const {
  getNoteBySharingUrlRequest,
  getNoteBySharingUrlSuccess,
  getNoteBySharingUrlFailure,
  getNoteBySharingUrlFinalized,
} = sharedNoteSlice.actions;

export const sharedNoteReducer = sharedNoteSlice.reducer;
