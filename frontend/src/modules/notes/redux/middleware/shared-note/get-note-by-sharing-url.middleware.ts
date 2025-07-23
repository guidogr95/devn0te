import { Middleware } from "@reduxjs/toolkit";
import { NotesAdapter } from "../../../interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";
import { getNoteBySharingUrlFailure, getNoteBySharingUrlFinalized, getNoteBySharingUrlSuccess, sharedNoteActions } from "../../slice/shared-note.slice";
import { ShareNoteErrorCodesEnum } from "devnote/modules/notes/errors/share-note.error";

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

export const getNoteBySharingUrlFailureMiddleware: Middleware = (_api) => next => async action => {
  next(action);

  if (sharedNoteActions.getNoteBySharingUrlFailure.match(action)) {
    
    if (action.payload.code === ShareNoteErrorCodesEnum.PROTECTED_PASSWORD_UNAUTHORIZED) {
      //
    }

  }
};


