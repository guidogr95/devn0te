import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NoteEntity } from "../../core/entity/note.entity";
import * as createNoteReducers from "../reducer/notes/create-note.reducers";
import * as updateNoteReducers from "../reducer/notes/update-note-by-id.reducers";
import * as getNoteByIdReducers from "../reducer/notes/get-note-by-id.reducers";
import * as deleteNoteByIdReducers from "../reducer/notes/delete-note-by-id.reducers";
import * as getNotesListReducers from "../reducer/notes/get-notes-list.reducers";
import * as shareNoteReducers from "../reducer/notes/share-note.reducers";
import * as deltaSyncNotesReducers from "../reducer/notes/delta-sync-notes.reducers";
import * as queryLocalNotesReducers from "../reducer/notes/query-local-notes.reducers";
import { DomainErrorData } from "devnote/modules/auth/core/http-error";
import { GetNotesSortOptions } from "../../core/get-notes-sort-options";
import { NoteErrorValueObject } from "../../core/value-object/note-error-value-object";
import { LocalNoteEntity } from "../../core/entity/local-note-entity";
import { PaginatedNotesPreviewValueObject } from "../../core/get-notes-preview-response";

export type NotesState = {
  notesList: PaginatedNotesPreviewValueObject | null
	isLoadingNotes: boolean
	isLoadingNotesNextPage: boolean
	isLoadingActiveNote: boolean
  notesError?: string
  updateNoteError?: string

  // active note
  activeNoteError?: NoteErrorValueObject | null
  activeNote: NoteEntity | null
  activeNoteId: number | null,

  isNoteChangesUnsavedMap: Record<number, boolean>
  isNoteUpdatingMap: Record<number, boolean>
  isNoteDeletingMap: Record<number, boolean>
  isLoadingCreateNote: boolean
  creatingNoteError?: string
  deletingNoteError?: string
  isLoadingShareNote: boolean;
  sharingNoteError?: DomainErrorData;
  notesNextPageError?: string;
  noteListSortOptions: GetNotesSortOptions

  //delta sync
  isLoadingDeltaSync: boolean
  deltaSyncError?: string
  localNotesList: LocalNoteEntity[]
  isLoadingLocalNoteList: boolean
  localNotesError: string | null

  // local notes query
  localQuerySearchTerm: string
  isLoadingLocalQuery: boolean
  localQueryError: string | null
  localQueryResults: LocalNoteEntity[]
  selectedIndex: number


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
  //active note
  activeNote: null,
  activeNoteId: null,

  isNoteChangesUnsavedMap: {},
  isNoteUpdatingMap: {},
  isNoteDeletingMap: {},
  isLoadingShareNote: false,
  sharingNoteError: undefined,
  notesNextPageError: undefined,
  noteListSortOptions: {
    value: "updatedAt",
    direction: "desc"
  },

  //delta sync
  isLoadingDeltaSync: false,
  deltaSyncError: undefined,
  localNotesList: [],
  isLoadingLocalNoteList: false,
  localNotesError: null,


  // local notes query
  localQuerySearchTerm: "",
  isLoadingLocalQuery: false,
  localQueryError: null,
  localQueryResults: [],
  selectedIndex: 0
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
    // delta sync
    ...deltaSyncNotesReducers,
    // query local notes
    ...queryLocalNotesReducers,
    setNotesList(state, action: PayloadAction<PaginatedNotesPreviewValueObject>) {
      state.notesList = action.payload;
    },
    setActiveNoteId(state, action: PayloadAction<number | null>) {
      state.activeNoteId = action.payload;
    },
    setActiveNote(state, action: PayloadAction<NoteEntity | null>) {
      state.activeNote = action.payload;
      state.activeNoteError = null;
    },
  }
});

export const notesActions = notesSlice.actions;

export const {
  shareNoteRequest,
  shareNoteSuccess,
  shareNoteFailure,
  shareNoteFinalized,
  unshareNoteRequest,
  unshareNoteSuccess,
  unshareNoteFailure,
  unshareNoteFinalized,
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
  updateNoteInList,
  getNoteByIdRequest,
  getNoteByIdSuccess,
  getNoteByIdFailure,
  getNoteByIdFinalized,
  setActiveNote,
  setActiveNoteId,
  setNotesList,
  registerIsChangesUnsaved,
  //delta sync
  deltaSyncNotesRequest,
  deltaSyncNotesSuccess,
  deltaSyncNotesFailure,
  deltaSyncNotesFinalized,
  getLocalNotesRequest,
  getLocalNotesSuccess,
  getLocalNotesFailure,
  getLocalNotesFinalized,
  // local query
  queryLocalNotesRequest,
  queryLocalNotesSuccess,
  queryLocalNotesFailure,
  queryLocalNotesFinalized,
  queryLocalNotesCleanup,
  incrementSelectedIndex,
  decrementSelectedIndex,
  setLocalQuerySearchTerm
  
} = notesSlice.actions;

export const notesReducer = notesSlice.reducer;
