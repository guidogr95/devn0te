import { PayloadAction } from "@reduxjs/toolkit";
import { NotesState } from "../../slice/notes.slice";

export const deltaSyncNotesRequest = (state: NotesState, _action: PayloadAction<number>) => {
  state.isLoadingDeltaSync = true;
  state.deltaSyncError = "";
};

export const deltaSyncNotesSuccess = (_state: NotesState, _action: PayloadAction<void>) => {
};

export const deltaSyncNotesFailure = (state: NotesState, action: PayloadAction<string>) => {
  state.deltaSyncError = action.payload;
};

export const deltaSyncNotesFinalized = (state: NotesState) => {
  state.isLoadingDeltaSync = false;
};
