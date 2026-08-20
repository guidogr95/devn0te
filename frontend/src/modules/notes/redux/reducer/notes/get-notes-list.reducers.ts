import { PayloadAction } from "@reduxjs/toolkit";
import { NotesState } from "../../slice/notes.slice";
import { GetNotesSortOptions } from "devnote/modules/notes/core/get-notes-sort-options";
import { PaginatedNotesPreviewValueObject } from "devnote/modules/notes/core/get-notes-preview-response";
import { NoteEntity } from "devnote/modules/notes/core/entity/note.entity";

export const getNotesListRequest = (state: NotesState, action: PayloadAction<{ sortOptions: GetNotesSortOptions}>) => {
  state.isLoadingNotes = true;
  state.notesError = "";
  state.noteListSortOptions = action.payload.sortOptions;
};

export const getNotesListSuccess = (state: NotesState, action: PayloadAction<PaginatedNotesPreviewValueObject>) => {
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

export const getNotesListNextPageSuccess = (state: NotesState, action: PayloadAction<PaginatedNotesPreviewValueObject>) => {
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

export const updateNoteInList = (state: NotesState, action: PayloadAction<NoteEntity>) => {
  if (!state.notesList) return;
  const note = action.payload;
  const index = state.notesList.data.findIndex(n => n.id === note.id);
  if (index === -1) return;
  const item = state.notesList.data[index];
  item.title = note.title;
  item.updatedAt = note.updatedAt;
  if (note.content !== undefined) {
    item.preview = note.content.replace(/[#*_`>!\[\]()]/g, '').trim().slice(0, 120);
  }
};

