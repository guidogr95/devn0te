import { Middleware } from "@reduxjs/toolkit";
import {
  notesActions,
  deleteNoteByIdFailure,
  deleteNoteByIdSuccess,
  deleteNoteByIdFinalized,
  setNotesList
} from "../../slice/notes.slice";
import { NotesAdapter } from "../../../interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";
import { RootState } from "devnote/redux/store/store";
import { showToast } from "devnote/modules/shared/redux/slice/toast.slice";

export const deleteNoteByIdFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.deleteNoteByIdRequest.match(action)) {

    const response = await NotesAdapter.deleteNoteById(action.payload);

    if (isHttpError(response)) {
      api.dispatch(deleteNoteByIdFailure(response.message));
    } else {
      api.dispatch(deleteNoteByIdSuccess(response));
    }
    api.dispatch(deleteNoteByIdFinalized(action.payload));
  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const deleteNoteByIdSuccessMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  if (notesActions.deleteNoteByIdSuccess.match(action)) {

    api.dispatch(showToast({ type: "success", message: "Note deleted successfully!" }));

    const state = api.getState();
    const { notesList, activeNote } = state.notes;


    const note = action.payload;

    if (activeNote?.id === note.id) {
      // api
    }

    if (notesList?.length) {
      const updatedNotesList = notesList.filter(_note => _note.id !== note.id);
      api.dispatch(setNotesList(updatedNotesList));
    }

  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const deleteNoteByIdFailureMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  if (notesActions.deleteNoteByIdFailure.match(action)) {
    api.dispatch(showToast({ type: "error", message: "Error deleting note" }));
  }
};
