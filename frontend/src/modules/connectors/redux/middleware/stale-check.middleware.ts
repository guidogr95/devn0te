import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "devnote/redux/store/store";
import { getConnector } from "../../interface/connector-factory";
import { getConnectorSyncedNotes } from "../../../../../lib/sqlite";
import {
  connectorActions,
  checkStaleNotesSuccess,
  checkStaleNotesFinalized,
} from "../slice/connector.slice";
import { buildConnectorKey } from "devnote/modules/notes/redux/middleware/notes/push-sync.middleware";

export const staleCheckMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (connectorActions.checkStaleNotesRequest.match(action)) {
    try {
      const state = api.getState() as RootState;
      const { auth, connector: connectorState } = state;

      if (!auth.user || !connectorState.settings) {
        api.dispatch(checkStaleNotesSuccess([]));
        return;
      }

      const connector = getConnector(connectorState.settings);
      if (!connector) {
        api.dispatch(checkStaleNotesSuccess([]));
        return;
      }

      const connectorKey = buildConnectorKey(connectorState.settings as { type: string; owner: string; repo: string; branch: string });

      const [remoteManifest, localSynced] = await Promise.all([
        connector.listManifest(),
        getConnectorSyncedNotes({ userId: auth.user.id, connectorKey }),
      ]);

      const remoteIds = new Set(remoteManifest.notes.map(n => n.connectorId));
      const stale = localSynced.filter(n => !remoteIds.has(n.connectorId));

      api.dispatch(checkStaleNotesSuccess(stale));
    } catch {
      api.dispatch(checkStaleNotesSuccess([]));
    } finally {
      api.dispatch(checkStaleNotesFinalized());
    }
  }
};
