import { PayloadAction } from "@reduxjs/toolkit";
import { NoteEntity } from "../../../core/entity/note.entity";
import { NotesState } from "../../slice/notes.slice";

export const getNoteByIdRequest = (state: NotesState, _action: PayloadAction<number>) => {
  state.isLoadingActiveNote = true;
  state.activeNoteError = "";
  state.activeNote = null;
};

export const getNoteByIdSuccess = (state: NotesState, action: PayloadAction<NoteEntity>) => {
  state.activeNote = action.payload;
};

export const getNoteByIdFailure = (state: NotesState, action: PayloadAction<string>) => {
  state.activeNoteError = action.payload;
};

export const getNoteByIdFinalized = (state: NotesState) => {
  state.isLoadingActiveNote = false;
};
