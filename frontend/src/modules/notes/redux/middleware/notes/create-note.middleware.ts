import { Middleware } from "@reduxjs/toolkit";
import {
  createNoteFailure,
  createNoteFinalized,
  createNoteSuccess,
  notesActions,
} from "../../slice/notes.slice";
import { NotesAdapter } from "../../../interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";

export const createNoteFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.createNoteRequest.match(action)) {

    const response = await NotesAdapter.createNote(action.payload);

    if (isHttpError(response)) {
      api.dispatch(createNoteFailure(response.message));
    } else {
      api.dispatch(createNoteSuccess(response));
    }
    api.dispatch(createNoteFinalized());
  }
};
