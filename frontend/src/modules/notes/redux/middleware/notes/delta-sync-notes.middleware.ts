import { Middleware } from "@reduxjs/toolkit";
import {
  deltaSyncNotesFailure,
  deltaSyncNotesFinalized,
  deltaSyncNotesSuccess,
  getLocalNotesRequest,
  getNotesListRequest,
  notesActions,
} from "../../slice/notes.slice";
import { NotesAdapter } from "../../../interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";
import LocalStorage from "devnote/core/local-storage";
import { initSQLite, syncNotesDelta, clearUserData, syncNotesFromConnector } from "../../../../../../lib/sqlite";
import { RootState } from "devnote/redux/store/store";
import { executePush, buildConnectorKey } from "./push-sync.middleware";
import { getConnector } from "devnote/modules/connectors/interface/connector-factory";

export const deltaSyncNotesFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.deltaSyncNotesRequest.match(action)) {

    const userId = action.payload;
    const storageKey = `last_synced_${userId}`;
    const lastSync = LocalStorage.getItem<string>(storageKey);

    const { config, connector: connectorState } = api.getState() as RootState;

    try {
      await initSQLite();

      // Pull from connector first so notes already in the repo are marked
      // connector_synced_for before executePush runs — avoiding redundant pushes.
      const connector = getConnector(connectorState.settings);
      if (connector && connectorState.settings) {
        const connectorKey = buildConnectorKey(connectorState.settings as { type: string; owner: string; repo: string; branch: string });
        const connectorCursorKey = `connector_cursor_${userId}`;
        const connectorCursor = LocalStorage.getItem<string>(connectorCursorKey);
        const connectorResult = await connector.pull(connectorCursor);
        if (connectorResult.notes.length > 0 || connectorResult.deleted.length > 0) {
          await syncNotesFromConnector({ notes: connectorResult.notes, deleted: connectorResult.deleted, userId, connectorKey });
        }
        LocalStorage.setItem(connectorCursorKey, connectorResult.cursor);
      }

      await executePush(api);

      if (config.serverSyncEnabled) {
        if (!lastSync) {
          await clearUserData();
        }

        const response = await NotesAdapter.getDeltaNotes();

        if (isHttpError(response)) {
          throw new Error(`delta sync failed ${response}`);
        }

        await syncNotesDelta({ ...response, userId });
        LocalStorage.setItem(storageKey, new Date().toISOString());
      }

      api.dispatch(deltaSyncNotesSuccess());

    } catch(err) {
      console.error(err);
      api.dispatch(deltaSyncNotesFailure("Unknown note delta sync error"));
      api.dispatch(getLocalNotesRequest());
    } finally {
      api.dispatch(deltaSyncNotesFinalized());
    }
  }
};

export const deltaSyncNotesSuccessMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.deltaSyncNotesSuccess.match(action)) {
    const { notes } = api.getState() as RootState;
    api.dispatch(getLocalNotesRequest());
    api.dispatch(getNotesListRequest({ sortOptions: notes.noteListSortOptions }));
  }
};
