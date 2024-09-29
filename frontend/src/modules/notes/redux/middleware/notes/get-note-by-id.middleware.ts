import { Middleware } from "@reduxjs/toolkit";
import { getNoteByIdFailure, getNoteByIdFinalized, getNoteByIdSuccess, notesActions } from "../../slice/notes.slice";
import { NotesAdapter } from "../../../interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";

export const getNoteByIdFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.getNoteByIdRequest.match(action)) {
    const response = await NotesAdapter.getNoteById(action.payload);
    if (isHttpError(response)) {
      api.dispatch(getNoteByIdFailure(response.message));
    } else {
      api.dispatch(getNoteByIdSuccess(response));
    }
    api.dispatch(getNoteByIdFinalized());
  }
};
