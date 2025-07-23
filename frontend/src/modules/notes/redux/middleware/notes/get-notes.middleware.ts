import { Middleware } from "@reduxjs/toolkit";
import { getNotesListFailure, getNotesListFinalized, getNotesListNextPageFailure, getNotesListNextPageFinalized, getNotesListNextPageSuccess, getNotesListSuccess, notesActions } from "../../slice/notes.slice";
import { NotesAdapter } from "../../../interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";
import { RootState } from "devnote/redux/store/store";

export const getNotesFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.getNotesListRequest.match(action)) {
    

    const response = await NotesAdapter.getNotes({
      sortBy: action.payload.sortOptions.value,
      sortDirection: action.payload.sortOptions.direction
    });
    if (isHttpError(response)) {
      api.dispatch(getNotesListFailure(response.message));
    } else {
      api.dispatch(getNotesListSuccess(response));
    }
    api.dispatch(getNotesListFinalized());
  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const getNotesListNextPageFlowMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  if (notesActions.getNotesListNextPageRequest.match(action)) {

    const { notes } = api.getState();
    const { notesList, noteListSortOptions } = notes;
    if (!notesList) return;

    const response = await NotesAdapter.getNotes({
      page: notesList.pagination.currentPage + 1,
      sortBy: noteListSortOptions.value,
      sortDirection: noteListSortOptions.direction
    });

    if (isHttpError(response)) {
      api.dispatch(getNotesListNextPageFailure(response.message));
    } else {
      api.dispatch(getNotesListNextPageSuccess(response));
    }
    api.dispatch(getNotesListNextPageFinalized());
  }
};
