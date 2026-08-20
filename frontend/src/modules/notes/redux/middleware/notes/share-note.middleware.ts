import { Middleware } from "@reduxjs/toolkit";
import {
  notesActions,
  shareNoteFailure,
  shareNoteFinalized,
  shareNoteSuccess,
  unshareNoteFailure,
  unshareNoteFinalized,
  unshareNoteSuccess,
} from "../../slice/notes.slice";
import { NotesAdapter } from "../../../interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";
import { showToast } from "devnote/modules/shared/redux/slice/toast.slice";
import { ShowToastPayloadType } from "devnote/modules/shared/core/toast-types";
import { SHARED_PASSWORD_MISSING_CODE } from "devnote/core/constants/note-error-codes";
import { RootState } from "devnote/redux/store/store";

export const shareNoteFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.shareNoteRequest.match(action)) {

    const response = await NotesAdapter.shareNote(action.payload.noteId, action.payload.input);

    if (isHttpError(response)) {
      api.dispatch(shareNoteFailure({ data: response.data, code: response.code }));
    } else {
      api.dispatch(shareNoteSuccess(response));
    }
    api.dispatch(shareNoteFinalized());
  }

  if (notesActions.unshareNoteRequest.match(action)) {

    const response = await NotesAdapter.unshareNote(action.payload.noteId);

    if (isHttpError(response)) {
      api.dispatch(unshareNoteFailure({ data: response.data, code: response.code }));
    } else {
      api.dispatch(unshareNoteSuccess(response));
    }
    api.dispatch(unshareNoteFinalized());
  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const shareNoteSuccessMiddleware: Middleware<{}, RootState>  = (api) => next => async action => {
  next(action);

  if (notesActions.shareNoteSuccess.match(action)) {

    api.dispatch(showToast({ type: "success", message: "Note shared successfully!" }));

  }

  if (notesActions.unshareNoteSuccess.match(action)) {

    api.dispatch(showToast({ type: "success", message: "Note unshared \u2014 the link no longer works." }));

  }
};

export const shareNoteFailureMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.shareNoteFailure.match(action)) {

    const toastPayload: ShowToastPayloadType = { type: "error", message: "Error sharing note" };

    if (action.payload.code === SHARED_PASSWORD_MISSING_CODE) {
      toastPayload.message = "Password is required";
    }

    api.dispatch(showToast(toastPayload));

  }

  if (notesActions.unshareNoteFailure.match(action)) {

    api.dispatch(showToast({ type: "error", message: "Error unsharing note." }));

  }
};
