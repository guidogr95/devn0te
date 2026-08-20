import { Middleware } from "@reduxjs/toolkit";
import { NotesAdapter } from "../../../interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";
import { getNoteBySharingUrlFinalized, getNoteBySharingUrlSuccess, sharedNoteActions, getNoteBySharingUrlFailure } from "../../slice/shared-note.slice";

export const getNoteBySharingUrlFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (sharedNoteActions.getNoteBySharingUrlRequest.match(action)) {
    const response = await NotesAdapter.getNoteBySharingUrl(action.payload.sharingUrl, action.payload.input);
    if (isHttpError(response)) {
      api.dispatch(getNoteBySharingUrlFailure({ data: response.data, code: response.code }));
    } else {
      api.dispatch(getNoteBySharingUrlSuccess(response));
    }
    api.dispatch(getNoteBySharingUrlFinalized());
  }
};
