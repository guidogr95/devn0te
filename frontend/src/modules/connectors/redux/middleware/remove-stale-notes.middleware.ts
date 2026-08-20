import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "devnote/redux/store/store";
import { removeStaleNotes } from "../../../../../lib/sqlite";
import { getLocalNotesRequest } from "devnote/modules/notes/redux/slice/notes.slice";
import {
  connectorActions,
  removeStaleNotesSuccess,
} from "../slice/connector.slice";

export const removeStaleNotesMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (connectorActions.removeStaleNotesRequest.match(action)) {
    const state = api.getState() as RootState;
    const { auth, connector: connectorState } = state;

    if (!auth.user || !connectorState.staleNotes || connectorState.staleNotes.length === 0) {
      api.dispatch(removeStaleNotesSuccess());
      return;
    }

    const connectorIds = connectorState.staleNotes.map(n => n.connectorId);

    try {
      await removeStaleNotes({ connectorIds, userId: auth.user.id });
      api.dispatch(removeStaleNotesSuccess());
      api.dispatch(getLocalNotesRequest());
    } catch {
      // stale notes removal failed silently — list remains in state for retry
    }
  }
};
