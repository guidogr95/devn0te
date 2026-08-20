import { PayloadAction } from "@reduxjs/toolkit";
import { NoteEntity } from "../../../core/entity/note.entity";
import { NotesState } from "../../slice/notes.slice";
import { ShareNoteInput } from "../../../core/share-note-input";
import { DomainErrorData } from "devnote/modules/auth/core/http-error";

export const shareNoteRequest = (state: NotesState, _action: PayloadAction<{ noteId: number, input: ShareNoteInput }>) => {
  state.isLoadingShareNote = true;
  state.sharingNoteError = undefined;
};

export const shareNoteSuccess = (_state: NotesState, _action: PayloadAction<NoteEntity>) => {

};

export const shareNoteFailure = (state: NotesState, action: PayloadAction<DomainErrorData>) => {
  state.sharingNoteError = action.payload;
};

export const shareNoteFinalized = (state: NotesState) => {
  state.isLoadingShareNote = false;
};

export const unshareNoteRequest = (state: NotesState, _action: PayloadAction<{ noteId: number }>) => {
  state.isLoadingShareNote = true;
  state.sharingNoteError = undefined;
};

export const unshareNoteSuccess = (_state: NotesState, _action: PayloadAction<NoteEntity>) => {

};

export const unshareNoteFailure = (state: NotesState, action: PayloadAction<DomainErrorData>) => {
  state.sharingNoteError = action.payload;
};

export const unshareNoteFinalized = (state: NotesState) => {
  state.isLoadingShareNote = false;
};
