import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NoteEntity } from "../../core/entity/note.entity";
import * as createNoteReducers from "../reducer/notes/create-note.reducers";
import * as updateNoteReducers from "../reducer/notes/update-note-by-id.reducers";
import * as getNoteByIdReducers from "../reducer/notes/get-note-by-id.reducers";
import * as deleteNoteByIdReducers from "../reducer/notes/delete-note-by-id.reducers";
import * as getNotesListReducers from "../reducer/notes/get-notes-list.reducers";
import * as shareNoteReducers from "../reducer/notes/share-note.reducers";
import { DomainErrorData } from "devnote/modules/auth/core/http-error";
import { PaginatedNotesValueObject } from "../../core/get-notes-response";
import { GetNotesSortOptions } from "../../core/get-notes-sort-options";

export type NotesState = {
  notesList: PaginatedNotesValueObject | null
	isLoadingNotes: boolean
	isLoadingNotesNextPage: boolean
	isLoadingActiveNote: boolean
  notesError?: string
  updateNoteError?: string
  activeNoteError?: string
  activeNote: NoteEntity | null
  isNoteChangesUnsavedMap: Record<number, boolean>
  isNoteUpdatingMap: Record<number, boolean>
  isNoteDeletingMap: Record<number, boolean>
  updateNoteAbortControllerMap: Record<number, AbortController | null>
  isLoadingCreateNote: boolean
  creatingNoteError?: string
  deletingNoteError?: string
  isLoadingShareNote: boolean;
  sharingNoteError?: DomainErrorData;
  notesNextPageError?: string;
  noteListSortOptions: GetNotesSortOptions
}

const initialState: NotesState = {
  notesList: null,
	isLoadingNotes: false,
  isLoadingNotesNextPage: false,
	isLoadingActiveNote: false,
	isLoadingCreateNote: false,
  creatingNoteError: undefined,
  deletingNoteError: undefined,
  notesError: undefined,
  activeNote: null,
  isNoteChangesUnsavedMap: {},
  isNoteUpdatingMap: {},
  isNoteDeletingMap: {},
  updateNoteAbortControllerMap: {},
  isLoadingShareNote: false,
  sharingNoteError: undefined,
  notesNextPageError: undefined,
  noteListSortOptions: {
    value: "updatedAt",
    direction: "desc"
  }
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    // Share note
    ...shareNoteReducers,
    // Delete note by id
    ...deleteNoteByIdReducers,
    // Create note
    ...createNoteReducers,
    // Update note
    ...updateNoteReducers,
    // get note by id
    ...getNoteByIdReducers,
    // get note list
    ...getNotesListReducers,
    setNotesList(state, action: PayloadAction<PaginatedNotesValueObject>) {
      state.notesList = action.payload;
    },
    setActiveNote(state, action: PayloadAction<NoteEntity>) {
      state.activeNote = action.payload;
    },
    updateNoteListItem(state, action: PayloadAction<{ index: number, note: NoteEntity }>) {
      if (!state.notesList) return;
      state.notesList.data[action.payload.index] = action.payload.note;
    },
  }
});

export const notesActions = notesSlice.actions;

export const {
  shareNoteRequest,
  shareNoteSuccess,
  shareNoteFailure,
  shareNoteFinalized,
  deleteNoteByIdRequest,
  deleteNoteByIdSuccess,
  deleteNoteByIdFailure,
  deleteNoteByIdFinalized,
  createNoteRequest,
  createNoteSuccess,
  createNoteFailure,
  createNoteFinalized,
  updateNoteByIdRequest,
  updateNoteByIdSuccess,
  updateNoteByIdFailure,
  updateNoteByIdFinalized,
  getNotesListRequest,
  getNotesListSuccess,
  getNotesListFailure,
  getNotesListFinalized,
  getNotesListNextPageRequest,
  getNotesListNextPageSuccess,
  getNotesListNextPageFailure,
  getNotesListNextPageFinalized,
  getNoteByIdRequest,
  getNoteByIdSuccess,
  getNoteByIdFailure,
  getNoteByIdFinalized,
  setActiveNote,
  setNotesList,
  updateNoteListItem,
  setUpdateNoteAbortController,
  cancelUpdateNoteAbortController,
  registerIsChangesUnsaved
} = notesSlice.actions;

export const notesReducer = notesSlice.reducer;
