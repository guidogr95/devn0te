import { PayloadAction } from "@reduxjs/toolkit";
import { NoteEntity } from "../../../core/entity/note.entity";
import { NotesState } from "../../slice/notes.slice";
import { CreateNoteInput } from "../../../core/create-note-input";

export const createNoteRequest = (state: NotesState, _action: PayloadAction<CreateNoteInput>) => {
  state.isLoadingCreateNote = true;
  state.creatingNoteError = "";
};

export const createNoteSuccess = (state: NotesState, action: PayloadAction<NoteEntity>) => {
  state.notesList?.push(action.payload);
  state.activeNote = action.payload;
};

export const createNoteFailure = (state: NotesState, action: PayloadAction<string>) => {
  state.creatingNoteError = action.payload;
};

export const createNoteFinalized = (state: NotesState) => {
  state.isLoadingCreateNote = false;
};
