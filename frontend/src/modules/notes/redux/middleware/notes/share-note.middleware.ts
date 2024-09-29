import { Middleware } from "@reduxjs/toolkit";
import {
  notesActions,
  setActiveNote,
  shareNoteFailure,
  shareNoteFinalized,
  shareNoteSuccess,
  updateNoteListItem,
} from "../../slice/notes.slice";
import { NotesAdapter } from "../../../interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";
import { showToast } from "devnote/modules/shared/redux/slice/toast.slice";
import { ShowToastPayloadType } from "devnote/modules/shared/core/toast-types";
import { ShareNoteErrorCodesEnum } from "../../../errors/share-note.error";
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
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const shareNoteSuccessMiddleware: Middleware<{}, RootState>  = (api) => next => async action => {
  next(action);

  if (notesActions.shareNoteSuccess.match(action)) {

    const { notes } = api.getState();

    const note = action.payload;

    api.dispatch(showToast({ type: "success", message: "Note shared successfully!" }));

    const noteIndex = notes.notesList?.findIndex(_note => _note.id === note.id);

    if (noteIndex !== -1 && noteIndex !== undefined) {
      api.dispatch(updateNoteListItem({ index: noteIndex, note }));
    }

    if (notes.activeNote?.id === note.id) {
      api.dispatch(setActiveNote(note));
    }

  }
};

export const shareNoteFailureMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.shareNoteFailure.match(action)) {

    const toastPayload: ShowToastPayloadType = { type: "error", message: "Error sharing note" };

    if (action.payload.code === ShareNoteErrorCodesEnum.PROTECTED_PASSWORD_MISSING) {
      toastPayload.message = "Password is required";
    }

    api.dispatch(showToast(toastPayload));

  }
};
