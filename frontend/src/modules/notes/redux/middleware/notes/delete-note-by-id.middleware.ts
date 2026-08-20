import { Middleware } from "@reduxjs/toolkit";
import {
  notesActions,
  deleteNoteByIdFailure,
  deleteNoteByIdSuccess,
  deleteNoteByIdFinalized,
  setActiveNote,
  getLocalNotesRequest,
} from "../../slice/notes.slice";
import { RootState } from "devnote/redux/store/store";
import { showToast } from "devnote/modules/shared/redux/slice/toast.slice";
import { NoteEntity } from "../../../core/entity/note.entity";
import { NoteSharingTypeEnum } from "../../../core/enums/note-sharing-type.enum";
import { initSQLite, deleteNoteLocally } from "../../../../../../lib/sqlite";

export const deleteNoteByIdFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.deleteNoteByIdRequest.match(action)) {
    const state = api.getState() as RootState;
    const id = action.payload;

    const activeNote = state.notes.activeNote?.id === id ? state.notes.activeNote : null;
    const localNote = state.notes.localNotesList.find(n => n.id === id);
    const connectorId = activeNote?.connectorId ?? localNote?.connectorId;
    const userId = activeNote?.userId ?? localNote?.userId ?? state.auth.user?.id;

    if (!connectorId || !userId) {
      api.dispatch(deleteNoteByIdFailure("Note not found"));
      api.dispatch(deleteNoteByIdFinalized(id));
      return;
    }

    try {
      await initSQLite();

      await deleteNoteLocally({ connectorId, userId });

      const noteEntity: NoteEntity = activeNote ?? {
        id,
        connectorId,
        title: localNote?.title ?? "",
        content: localNote?.content ?? "",
        sharingType: NoteSharingTypeEnum.PRIVATE,
        sharingUrl: "",
        userId,
        createAt: localNote?.updatedAt ?? new Date().toISOString(),
        updatedAt: localNote?.updatedAt ?? new Date().toISOString(),
      };

      api.dispatch(deleteNoteByIdSuccess(noteEntity));
    } catch {
      api.dispatch(deleteNoteByIdFailure("Failed to delete note"));
    }

    api.dispatch(deleteNoteByIdFinalized(id));
  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const deleteNoteByIdSuccessMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  if (notesActions.deleteNoteByIdSuccess.match(action)) {

    api.dispatch(showToast({ type: "success", message: "Note deleted successfully!" }));

    const state = api.getState();
    const { activeNote } = state.notes;

    const note = action.payload;

    if (activeNote?.id === note.id) {
      api.dispatch(setActiveNote(null));
    }

    api.dispatch(getLocalNotesRequest());
  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const deleteNoteByIdFailureMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  if (notesActions.deleteNoteByIdFailure.match(action)) {
    api.dispatch(showToast({ type: "error", message: "Error deleting note" }));
  }
};
