import { PayloadAction } from "@reduxjs/toolkit";
import { NotesState } from "../../slice/notes.slice";
import { LocalNoteEntity } from "devnote/modules/notes/core/entity/local-note-entity";

export const getLocalNotesRequest = (state: NotesState, _action: PayloadAction<void>) => {
  state.isLoadingLocalNoteList = true;
  state.localNotesError = null;
  state.localNotesList = [];
};

export const getLocalNotesSuccess = (state: NotesState, action: PayloadAction<LocalNoteEntity[]>) => {
  state.localNotesList = action.payload;
};

export const getLocalNotesFailure = (state: NotesState, action: PayloadAction<string>) => {
  state.localNotesError = action.payload;
};

export const getLocalNotesFinalized = (state: NotesState, _action: PayloadAction<void>) => {
  state.isLoadingLocalNoteList = false;
};

export const queryLocalNotesRequest = (state: NotesState, _action: PayloadAction<string>) => {
  state.isLoadingLocalQuery = true;
  state.localQueryError = null;
  state.localQueryResults = [];
  state.selectedIndex = 0;
};

export const incrementSelectedIndex = (state: NotesState, _action: PayloadAction<void>) => {
  if (state.isLoadingLocalQuery) return;

  if (state.localQueryResults.length === 0) {
    state.selectedIndex = 0;
    return;
  }

  state.selectedIndex = Math.min(
    state.selectedIndex + 1,
    state.localQueryResults.length -1
  );
};

export const decrementSelectedIndex = (state: NotesState, _action: PayloadAction<void>) => {
  if (state.isLoadingLocalQuery) return;
  state.selectedIndex = Math.max(state.selectedIndex - 1, 0);
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

export const setLocalQuerySearchTerm =  (state: NotesState, action: PayloadAction<string>) => {
  state.localQuerySearchTerm = action.payload;
};

export const queryLocalNotesCleanup = (state: NotesState) => {
  state.localQueryError = null;
  state.localQueryResults = [];
  state.localQuerySearchTerm = "";
  state.selectedIndex = 0;
};
