import { Middleware } from "@reduxjs/toolkit";
import {
  notesActions,
  updateNoteByIdFailure,
  updateNoteByIdFinalized,
  updateNoteByIdSuccess,
  registerIsChangesUnsaved,
  deltaSyncNotesRequest,
  updateNoteInList
} from "../../slice/notes.slice";
import { RootState } from "devnote/redux/store/store";
import { NoteEntity } from "../../../core/entity/note.entity";
import { NoteSharingTypeEnum } from "../../../core/enums/note-sharing-type.enum";
import { initSQLite, updateNoteLocally } from "../../../../../../lib/sqlite";

export const updateNoteByIdFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.updateNoteByIdRequest.match(action)) {
    const state = api.getState() as RootState;
    const id = action.payload.id;

    const connectorId = state.notes.activeNote?.id === id
      ? state.notes.activeNote.connectorId
      : state.notes.localNotesList.find(n => n.id === id)?.connectorId;

    if (!connectorId) {
      api.dispatch(updateNoteByIdFailure("Note not found"));
      api.dispatch(updateNoteByIdFinalized(id));
      return;
    }

    try {
      await initSQLite();

      const now = new Date().toISOString();

      await updateNoteLocally({
        connectorId,
        title: action.payload.title,
        content: action.payload.content,
        updatedAt: now,
      });

      const currentNote = state.notes.activeNote;
      const updatedNote: NoteEntity = {
        id,
        connectorId,
        title: action.payload.title ?? currentNote?.title ?? "",
        content: action.payload.content ?? currentNote?.content ?? "",
        sharingType: currentNote?.sharingType ?? NoteSharingTypeEnum.PRIVATE,
        sharingUrl: currentNote?.sharingUrl ?? "",
        userId: currentNote?.userId ?? state.auth.user?.id ?? 0,
        createAt: currentNote?.createAt ?? now,
        updatedAt: now,
      };

      api.dispatch(updateNoteByIdSuccess(updatedNote));
    } catch {
      api.dispatch(updateNoteByIdFailure("Failed to update note"));
    }

    api.dispatch(updateNoteByIdFinalized(id));
  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const updateNoteByIdSuccessMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  if (notesActions.updateNoteByIdSuccess.match(action)) {
    const note = action.payload;

    const state = api.getState();

    api.dispatch(registerIsChangesUnsaved({ id: note.id, state: false }));
    api.dispatch(updateNoteInList(note));

    const { user } = state.auth;

    if (user) {
      api.dispatch(deltaSyncNotesRequest(user.id));
    }
  }
};



