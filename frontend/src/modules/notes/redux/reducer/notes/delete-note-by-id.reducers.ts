import { PayloadAction } from "@reduxjs/toolkit";
import { NoteEntity } from "../../../core/entity/note.entity";
import { NotesState } from "../../slice/notes.slice";

export const deleteNoteByIdRequest = (state: NotesState, action: PayloadAction<number>) => {
  state.isNoteDeletingMap[action.payload] = true;
  state.deletingNoteError = "";
};

export const deleteNoteByIdSuccess = (_state: NotesState, _action: PayloadAction<NoteEntity>) => {
};

export const deleteNoteByIdFailure = (state: NotesState, action: PayloadAction<string>) => {
  state.deletingNoteError = action.payload;
};

export const deleteNoteByIdFinalized = (state: NotesState, action: PayloadAction<number>) => {
  state.isNoteDeletingMap[action.payload] = false;
};
