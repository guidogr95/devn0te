import { PayloadAction } from "@reduxjs/toolkit";
import { NotesState } from "../../slice/notes.slice";
import { PaginatedNotesValueObject } from "devnote/modules/notes/core/get-notes-response";
import { GetNotesSortOptions } from "devnote/modules/notes/core/get-notes-sort-options";

export const getNotesListRequest = (state: NotesState, action: PayloadAction<{ sortOptions: GetNotesSortOptions}>) => {
  state.isLoadingNotes = true;
  state.notesError = "";
  state.notesList = null;
  state.noteListSortOptions = action.payload.sortOptions;
};

export const getNotesListSuccess = (state: NotesState, action: PayloadAction<PaginatedNotesValueObject>) => {
  state.notesList = action.payload;
};

export const getNotesListFailure = (state: NotesState, action: PayloadAction<string>) => {
  state.notesError = action.payload;
};

export const getNotesListFinalized = (state: NotesState) => {
  state.isLoadingNotes = false;
};

export const getNotesListNextPageRequest = (state: NotesState) => {
  state.isLoadingNotesNextPage = true;
  state.notesNextPageError = "";
};

export const getNotesListNextPageSuccess = (state: NotesState, action: PayloadAction<PaginatedNotesValueObject>) => {
  if (!state.notesList) return;
  state.notesList.data = [...state.notesList.data, ...action.payload.data];
  state.notesList.pagination = action.payload.pagination;
};

export const getNotesListNextPageFailure = (state: NotesState, action: PayloadAction<string>) => {
  state.notesNextPageError = action.payload;
};

export const getNotesListNextPageFinalized = (state: NotesState) => {
  state.isLoadingNotesNextPage = false;
};

