import { PayloadAction } from "@reduxjs/toolkit";
import { NoteEntity } from "../../../core/entity/note.entity";
import { UpdateNoteInput } from "../../../core/update-note-input";
import { NotesState } from "../../slice/notes.slice";

export const updateNoteByIdRequest = (state: NotesState, action: PayloadAction<UpdateNoteInput>) => {
  state.isNoteUpdatingMap[action.payload.id] = true;
};

export const updateNoteByIdSuccess = (_state: NotesState, _action: PayloadAction<NoteEntity>) => {
};

export const updateNoteByIdFailure = (state: NotesState, action: PayloadAction<string>) => {
  state.updateNoteError = action.payload;
};

export const updateNoteByIdFinalized = (state: NotesState, action: PayloadAction<number>) => {
  state.isNoteUpdatingMap[action.payload] = false;
};



export const registerIsChangesUnsaved = (state: NotesState, action: PayloadAction<{ id: number, state: boolean }>) => {
  state.isNoteChangesUnsavedMap[action.payload.id] = action.payload.state;
};
