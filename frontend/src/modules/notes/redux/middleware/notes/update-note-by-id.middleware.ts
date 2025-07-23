import { Middleware } from "@reduxjs/toolkit";
import {
  notesActions,
  updateNoteByIdFailure,
  updateNoteListItem,
  updateNoteByIdFinalized,
  updateNoteByIdSuccess,
  setUpdateNoteAbortController,
  cancelUpdateNoteAbortController,
  registerIsChangesUnsaved,
  setActiveNote
} from "../../slice/notes.slice";
import { NotesAdapter } from "../../../interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";
import { RootState } from "devnote/redux/store/store";

export const updateNoteByIdFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.updateNoteByIdRequest.match(action)) {

    api.dispatch(cancelUpdateNoteAbortController({ id: action.payload.id }));

    const abortController = new AbortController();

    api.dispatch(setUpdateNoteAbortController({ id: action.payload.id, controller: abortController }));

    const response = await NotesAdapter.updateNoteById(action.payload, { signal: abortController.signal });

    if (isHttpError(response)) {
      api.dispatch(updateNoteByIdFailure(response.message));
    } else {
      api.dispatch(updateNoteByIdSuccess(response));
    }
    api.dispatch(updateNoteByIdFinalized(action.payload.id));
  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const updateNoteByIdSuccessMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  if (notesActions.updateNoteByIdSuccess.match(action)) {
    const note = action.payload;

    const state = api.getState();
    const { notesList, activeNote } = state.notes;

    api.dispatch(registerIsChangesUnsaved({ id: note.id, state: false }));

    const noteIndex = notesList?.data.findIndex(_note => _note.id === note.id);

    if (noteIndex !== -1 && noteIndex !== undefined) {
      api.dispatch(updateNoteListItem({ index: noteIndex, note }));
    }

    if (activeNote?.id === note.id) {
      api.dispatch(setActiveNote(note));
    }
  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const cancelUpdateNoteByIdMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  if (notesActions.cancelUpdateNoteAbortController.match(action)) {
    const state = api.getState();
    const { updateNoteAbortControllerMap } = state.notes;
    
    const abortController = updateNoteAbortControllerMap[action.payload.id];

    if (!abortController) return;

    abortController.abort();

    api.dispatch(setUpdateNoteAbortController({ id: action.payload.id, controller: null }));
  }
};
