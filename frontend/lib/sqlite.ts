import { SQLiteWorkerActionsEnum } from "devnote/core/enums/sqlite-worker-actions.enum";
import { SQLiteNotesDeltaPayload } from "devnote/core/types/sqlite-notes-delta-payload.type";
import {
  ClearPendingSyncArgs,
  ClearServerPendingSyncArgs,
  DeleteNoteArgs,
  GetPendingNotesArgs,
  GetConnectorPendingNotesArgs,
  GetConnectorSyncedNotesArgs,
  GetAllNotesForExportArgs,
  RemoveStaleNotesArgs,
  InsertNoteArgs,
  QueryNotesArgs,
  SetConnectorSyncedForArgs,
  SyncNotesFromConnectorArgs,
  UpdateNoteArgs,
  WorkerMessage,
} from "devnote/core/types/sqlite-worker-messages.type";
import { LocalNoteEntity } from "devnote/modules/notes/core/entity/local-note-entity";
import { SyncNoteEntity } from "devnote/modules/notes/core/entity/sync-note.entity";

export type PendingNoteEntity = SyncNoteEntity & {
  pendingAction: string
}

export type PendingDeleteEntity = {
  connectorId: string
  serverId: number
}

export type PendingChanges = {
  notes: PendingNoteEntity[]
  deletes: PendingDeleteEntity[]
}


let worker: Worker | null = null;
let nextRequestId = 0;

type PendingRequest = {
  resolve: (data: Record<string, unknown>) => void
  reject: (err: Error) => void
}

const pendingRequests = new Map<string, PendingRequest>();

export async function initSQLite(): Promise<void> {
  getWorker();
}

function postAndWait(message: Omit<WorkerMessage, "requestId">): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const requestId = String(nextRequestId++);
    pendingRequests.set(requestId, { resolve, reject });
    const w = getWorker();
    w.postMessage({ ...message, requestId });
  });
}

export async function insertSampleNote(note: SyncNoteEntity): Promise<void> {
  await postAndWait({
    action: SQLiteWorkerActionsEnum.INSERT_SAMPLE,
    payload: note
  });
}

export async function clearUserData(): Promise<void> {
  await postAndWait({
    action: SQLiteWorkerActionsEnum.CLEAR_USER_DATA,
    payload: undefined
  });
}

export async function queryNotes(options: QueryNotesArgs): Promise<LocalNoteEntity[]> {
  const data = await postAndWait({
    action: SQLiteWorkerActionsEnum.QUERY_NOTES,
    payload: options
  });
  return data.results as LocalNoteEntity[];
}

export async function syncNotesDelta(notesDelta: SQLiteNotesDeltaPayload): Promise<void> {
  await postAndWait({
    action: SQLiteWorkerActionsEnum.SYNC_NOTES_DELTA,
    payload: notesDelta
  });
}

export async function syncNotesFromServer(notes: SyncNoteEntity[]): Promise<void> {
  await postAndWait({
    action: SQLiteWorkerActionsEnum.SYNC_NOTES,
    payload: notes
  });
}

export async function insertNoteLocally(note: InsertNoteArgs): Promise<number> {
  const data = await postAndWait({
    action: SQLiteWorkerActionsEnum.INSERT_NOTE,
    payload: note,
  });
  return data.localId as number;
}

export async function updateNoteLocally(args: UpdateNoteArgs): Promise<void> {
  await postAndWait({
    action: SQLiteWorkerActionsEnum.UPDATE_NOTE,
    payload: args,
  });
}

export async function deleteNoteLocally(args: DeleteNoteArgs): Promise<void> {
  await postAndWait({
    action: SQLiteWorkerActionsEnum.DELETE_NOTE,
    payload: args,
  });
}

export async function getPendingChanges(args: GetPendingNotesArgs): Promise<PendingChanges> {
  const data = await postAndWait({
    action: SQLiteWorkerActionsEnum.GET_PENDING_NOTES,
    payload: args,
  });
  return data.result as PendingChanges;
}

export async function clearPendingSync(args: ClearPendingSyncArgs): Promise<void> {
  await postAndWait({
    action: SQLiteWorkerActionsEnum.CLEAR_PENDING_SYNC,
    payload: args,
  });
}

export async function clearServerPendingSync(args: ClearServerPendingSyncArgs): Promise<void> {
  await postAndWait({
    action: SQLiteWorkerActionsEnum.CLEAR_SERVER_PENDING_SYNC,
    payload: args,
  });
}

export async function syncNotesFromConnector(args: SyncNotesFromConnectorArgs): Promise<void> {
  await postAndWait({
    action: SQLiteWorkerActionsEnum.SYNC_NOTES_FROM_CONNECTOR,
    payload: args,
  });
}

export type ConnectorPendingChanges = {
  notes: PendingNoteEntity[]
  deletes: PendingDeleteEntity[]
}

export async function getConnectorPendingNotes(args: GetConnectorPendingNotesArgs): Promise<ConnectorPendingChanges> {
  const data = await postAndWait({
    action: SQLiteWorkerActionsEnum.GET_CONNECTOR_PENDING_NOTES,
    payload: args,
  });
  return data.result as ConnectorPendingChanges;
}

export async function setConnectorSyncedFor(args: SetConnectorSyncedForArgs): Promise<void> {
  await postAndWait({
    action: SQLiteWorkerActionsEnum.SET_CONNECTOR_SYNCED_FOR,
    payload: args,
  });
}

export async function getConnectorSyncedNotes(args: GetConnectorSyncedNotesArgs): Promise<{ connectorId: string; title: string }[]> {
  const data = await postAndWait({
    action: SQLiteWorkerActionsEnum.GET_CONNECTOR_SYNCED_NOTES,
    payload: args,
  });
  return data.result as { connectorId: string; title: string }[];
}

export async function getAllNotesForExport(args: GetAllNotesForExportArgs): Promise<{ connectorId: string; title: string; content: string; updatedAt: string }[]> {
  const data = await postAndWait({
    action: SQLiteWorkerActionsEnum.GET_ALL_NOTES_FOR_EXPORT,
    payload: args,
  });
  return data.result as { connectorId: string; title: string; content: string; updatedAt: string }[];
}

export async function removeStaleNotes(args: RemoveStaleNotesArgs): Promise<void> {
  await postAndWait({
    action: SQLiteWorkerActionsEnum.REMOVE_STALE_NOTES,
    payload: args,
  });
}


function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./sqlite-worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent) => {
      const { requestId } = event.data;
      if (!requestId) return;
      const pending = pendingRequests.get(requestId);
      if (!pending) return;
      pendingRequests.delete(requestId);
      if (event.data.success) pending.resolve(event.data);
      else pending.reject(new Error(event.data.error));
    };
  }
  return worker;
}
