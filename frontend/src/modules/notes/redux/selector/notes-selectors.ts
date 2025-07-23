import { RootState } from "../../../../redux/store/store";

export const selectIsLoadingNotesNextPage = (state: RootState) => state.notes.isLoadingNotesNextPage;

export const selectNotesList = (state: RootState) => state.notes.notesList;

export const selectIsLoadingNotes = (state: RootState) => state.notes.isLoadingNotes;

export const selectNotesError = (state: RootState) => state.notes.notesError;

export const selectActiveNoteError = (state: RootState) => state.notes.activeNoteError;

export const selectActiveNote = (state: RootState) => state.notes.activeNote;

export const selectIsLoadingActiveNote = (state: RootState) => state.notes.isLoadingActiveNote;

export const selectIsNoteUpdatingMap = (state: RootState) => state.notes.isNoteUpdatingMap;

export const selectIsChangesUnsavedMap = (state: RootState) => state.notes.isNoteChangesUnsavedMap;

export const selectIsNoteDeletingMap = (state: RootState) => state.notes.isNoteDeletingMap;

export const selectIsLoadingCreateNote = (state: RootState) => state.notes.isLoadingCreateNote;

export const selectIsLoadingShareNote = (state: RootState) => state.notes.isLoadingShareNote;

export const selectNotesListSortOptions = (state: RootState) => state.notes.noteListSortOptions;
