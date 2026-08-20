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
import { RootState } from "devnote/redux/store/store";
import { NoteSharingTypeEnum } from "../../../core/enums/note-sharing-type.enum";
import { NoteEntity } from "../../../core/entity/note.entity";
import { initSQLite, insertNoteLocally } from "../../../../../../lib/sqlite";
import { showToast } from "devnote/modules/shared/redux/slice/toast.slice";

export const createNoteFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.createNoteRequest.match(action)) {
    const { auth } = api.getState() as RootState;
    const userId = auth.user?.id;

    if (!userId) {
      api.dispatch(createNoteFailure("Not authenticated"));
      api.dispatch(createNoteFinalized());
      return;
    }

    try {
      await initSQLite();

      const connectorId = crypto.randomUUID();
      const now = new Date().toISOString();
      const title = action.payload.title ?? "";
      const content = action.payload.content ?? "";

      const localId = await insertNoteLocally({
        connectorId,
        userId,
        title,
        content,
        updatedAt: now,
      });

      const localNote: NoteEntity = {
        id: localId,
        connectorId,
        title,
        content,
        sharingType: NoteSharingTypeEnum.PRIVATE,
        sharingUrl: "",
        userId,
        createAt: now,
        updatedAt: now,
      };

      api.dispatch(createNoteSuccess(localNote));
    } catch {
      api.dispatch(createNoteFailure("Failed to create note"));
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const createNoteFailureMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  if (notesActions.createNoteFailure.match(action)) {
    api.dispatch(showToast({ type: "error", message: "Error creating note" }));
  }
};
