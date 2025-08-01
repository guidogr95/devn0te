import { Middleware } from "@reduxjs/toolkit";
import {
  createNoteFailure,
  createNoteFinalized,
  createNoteSuccess,
  deltaSyncNotesRequest,
  getNotesListRequest,
  notesActions,
  setActiveNote,
} from "../../slice/notes.slice";
import { NotesAdapter } from "../../../interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";
import { RootState } from "devnote/redux/store/store";

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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const createNoteSuccessMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  if (notesActions.createNoteSuccess.match(action)) {

    api.dispatch(getNotesListRequest({
      sortOptions: api.getState().notes.noteListSortOptions
    }));

    api.dispatch(setActiveNote(action.payload));

    const { auth } = api.getState();
    const { user } = auth;

    if (user) {
      api.dispatch(deltaSyncNotesRequest(user.id));
    }

  }
};
