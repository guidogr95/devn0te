import { Middleware } from "@reduxjs/toolkit";
import { getNoteByIdFailure, getNoteByIdFinalized, getNoteByIdSuccess, notesActions } from "../../slice/notes.slice";
import { NotesAdapter } from "../../../interface/adapters/notes.adapter";
import { isGetNoteError } from "devnote/modules/notes/core/value-object/note-error-value-object";

export const getNoteByIdFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.getNoteByIdRequest.match(action)) {
    const response = await NotesAdapter.getNoteById(action.payload);

    if (isGetNoteError(response)) {
      api.dispatch(getNoteByIdFailure(response));
    } else {
      api.dispatch(getNoteByIdSuccess(response));
    }
    api.dispatch(getNoteByIdFinalized());
  }
};
