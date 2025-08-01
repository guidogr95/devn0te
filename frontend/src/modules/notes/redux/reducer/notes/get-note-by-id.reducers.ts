import { PayloadAction } from "@reduxjs/toolkit";
import { NoteEntity } from "../../../core/entity/note.entity";
import { NotesState } from "../../slice/notes.slice";
import { NoteErrorValueObject } from "devnote/modules/notes/core/value-object/note-error-value-object";

export const getNoteByIdRequest = (state: NotesState, _action: PayloadAction<number>) => {
  state.isLoadingActiveNote = true;
  state.activeNoteError = null;
  state.activeNote = null;
};

export const getNoteByIdSuccess = (state: NotesState, action: PayloadAction<NoteEntity>) => {
  state.activeNote = action.payload;
};

export const getNoteByIdFailure = (state: NotesState, action: PayloadAction<NoteErrorValueObject>) => {
  state.activeNoteError = action.payload;
};

export const getNoteByIdFinalized = (state: NotesState) => {
  state.isLoadingActiveNote = false;
};
