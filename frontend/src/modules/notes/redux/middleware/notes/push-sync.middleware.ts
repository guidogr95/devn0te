import { Middleware } from "@reduxjs/toolkit";
import { notesActions, deltaSyncNotesRequest } from "../../slice/notes.slice";
import { NotesAdapter } from "../../../interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";
import { RootState } from "devnote/redux/store/store";
import { getPendingChanges, clearServerPendingSync, getConnectorPendingNotes, setConnectorSyncedFor } from "../../../../../../lib/sqlite";
import { getConnector } from "devnote/modules/connectors/interface/connector-factory";
import { showToast } from "devnote/modules/shared/redux/slice/toast.slice";
import { TITLE_TAKEN_CODE, CONNECTOR_ID_COLLISION_CODE } from "devnote/core/constants/note-error-codes";

let pushTimer: ReturnType<typeof setTimeout> | null = null;

export function buildConnectorKey(settings: { type: string; owner: string; repo: string; branch: string }): string {
  return `${settings.type}:${settings.owner}/${settings.repo}@${settings.branch}`;
}

export async function executePush(api: Parameters<Middleware>[0]): Promise<boolean> {
  const state = api.getState() as RootState;
  const { config, auth, connector: connectorState } = state;

  if (!auth.user) return false;

  const userId = auth.user.id;
  const connector = getConnector(connectorState.settings);

  if (!config.serverSyncEnabled && !connector) return false;

  try {
    let pushed = false;

    if (config.serverSyncEnabled) {
      const pending = await getPendingChanges({ userId });

      if (pending.notes.length > 0 || pending.deletes.length > 0) {
        const created = pending.notes
          .filter(n => n.pendingAction === "create")
          .map(n => ({ connector_id: n.connectorId, title: n.title, content: n.content }));

        const updated = pending.notes
          .filter(n => n.pendingAction !== "create")
          .map(n => ({ id: n.id, connector_id: n.connectorId, title: n.title, content: n.content }));

        const deleted = pending.deletes.map(d => d.connectorId);

        const response = await NotesAdapter.pushSync({ created, updated, deleted });

        if (!isHttpError(response)) {
          const allConnectorIds = [
            ...pending.notes.map(n => n.connectorId),
            ...pending.deletes.map(d => d.connectorId),
          ];
          await clearServerPendingSync({ connectorIds: allConnectorIds });
          pushed = true;
        } else if (response.code === TITLE_TAKEN_CODE) {
          api.dispatch(showToast({ type: "error", message: "A note with this title already exists." }));
        } else if (response.code === CONNECTOR_ID_COLLISION_CODE) {
          api.dispatch(showToast({ type: "error", message: "A note with this connector ID already exists." }));
        } else {
          console.error(`Batch push failed: ${response.message}`);
        }
      }
    }

    if (connector && connectorState.settings) {
      const connectorKey = buildConnectorKey(connectorState.settings as { type: string; owner: string; repo: string; branch: string });
      const pending = await getConnectorPendingNotes({ userId, connectorKey });

      if (pending.notes.length > 0 || pending.deletes.length > 0) {
        const changedNotes = pending.notes.map(n => ({
          connectorId: n.connectorId,
          title: n.title,
          content: n.content ?? "",
          updatedAt: n.updatedAt || new Date().toISOString(),
        }));
        const deletedIds = pending.deletes.map(d => d.connectorId);

        try {
          await connector.push(changedNotes, deletedIds);
          const allConnectorIds = [
            ...pending.notes.map(n => n.connectorId),
            ...pending.deletes.map(d => d.connectorId),
          ];
          await setConnectorSyncedFor({ connectorIds: allConnectorIds, connectorKey });
          pushed = true;
        } catch (err) {
          console.error("Connector push error:", err);
        }
      }
    }

    return pushed;
  } catch (err) {
    console.error("Push sync error:", err);
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const pushSyncMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  const isMutation =
    notesActions.createNoteSuccess.match(action) ||
    notesActions.updateNoteByIdSuccess.match(action) ||
    notesActions.deleteNoteByIdSuccess.match(action);

  if (isMutation) {
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(async () => {
      pushTimer = null;
      const pushed = await executePush(api);
      if (pushed) {
        api.dispatch(deltaSyncNotesRequest((api.getState() as RootState).auth.user!.id));
      }
    }, 2000);
  }
};
