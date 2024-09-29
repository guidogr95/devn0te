import { Middleware } from "@reduxjs/toolkit";
import { getNotesListFailure, getNotesListFinalized, getNotesListSuccess, notesActions } from "../../slice/notes.slice";
import { NotesAdapter } from "../../../interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";

export const getNotesFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.getNotesListRequest.match(action)) {
    const response = await NotesAdapter.getNotes();
    if (isHttpError(response)) {
      api.dispatch(getNotesListFailure(response.message));
    } else {
      api.dispatch(getNotesListSuccess(response));
    }
    api.dispatch(getNotesListFinalized());
  }
};
