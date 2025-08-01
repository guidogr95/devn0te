import { PayloadAction } from "@reduxjs/toolkit";
import { NotesState } from "../../slice/notes.slice";
import { LocalNoteEntity } from "devnote/modules/notes/core/entity/local-note-entity";

export const queryLocalNotesRequest = (state: NotesState, _action: PayloadAction<string>) => {
  state.isLoadingLocalQuery = true;
  state.localQueryError = null;
  state.localQueryResults = [];
};

export const queryLocalNotesSuccess = (state: NotesState, action: PayloadAction<LocalNoteEntity[]>) => {
  state.localQueryResults = action.payload;
};

export const queryLocalNotesFailure = (state: NotesState, action: PayloadAction<string>) => {
  state.localQueryError = action.payload;
};

export const queryLocalNotesFinalized = (state: NotesState) => {
  state.isLoadingLocalQuery = false;
};

export const queryLocalNotesCleanup = (state: NotesState) => {
  console.log("cleaning up");
  state.localQueryError = null;
  state.localQueryResults = [];
};
