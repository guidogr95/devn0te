import { RootState } from "../../../../redux/store/store";

export const selectIsLoadingLocalQuery = (state: RootState) => state.notes.isLoadingLocalQuery;

export const selectLocalQueryError = (state: RootState) => state.notes.localQueryError;

export const selectLocalQueryResults = (state: RootState) => state.notes.localQueryResults;
