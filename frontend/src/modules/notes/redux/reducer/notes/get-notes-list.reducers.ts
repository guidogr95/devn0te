import { PayloadAction } from "@reduxjs/toolkit";
import { NoteEntity } from "../../../core/entity/note.entity";
import { NotesState } from "../../slice/notes.slice";

export const getNotesListRequest = (state: NotesState) => {
  state.isLoadingNotes = true;
  state.notesError = "";
  state.notesList = null;
};

export const getNotesListSuccess = (state: NotesState, action: PayloadAction<NoteEntity[]>) => {
  state.notesList = action.payload;
};

export const getNotesListFailure = (state: NotesState, action: PayloadAction<string>) => {
  state.notesError = action.payload;
};

export const getNotesListFinalized = (state: NotesState) => {
  state.isLoadingNotes = false;
};
