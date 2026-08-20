import { RootState } from "../../../../redux/store/store";

export const selectIsLoadingLocalQuery = (state: RootState) => state.notes.isLoadingLocalQuery;

export const selectLocalQueryError = (state: RootState) => state.notes.localQueryError;

export const selectLocalQueryResults = (state: RootState) => state.notes.localQueryResults;

export const selectLocalQuerySearchTerm = (state: RootState) => state.notes.localQuerySearchTerm;

export const selectedSelectedIndex = (state: RootState) => state.notes.selectedIndex;

export const selectLocalNotesList = (state: RootState) => state.notes.localNotesList;

export const selectIsLoadingLocalNoteList = (state: RootState) => state.notes.isLoadingLocalNoteList;
