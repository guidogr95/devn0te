import { SyncNoteEntity } from "devnote/modules/notes/core/entity/sync-note.entity";
import { SQLiteWorkerActionsEnum } from "../enums/sqlite-worker-actions.enum";
import { SQLiteNotesDeltaPayload } from "./sqlite-notes-delta-payload.type";

type BaseWorkerMessage<T> = {
  action: SQLiteWorkerActionsEnum
  payload: T
  requestId: string
}

type InsertSampleMessage = BaseWorkerMessage<SyncNoteEntity> & {
  action: SQLiteWorkerActionsEnum.INSERT_SAMPLE
}

export type QueryNotesArgs = {
  searchTerm: string
  userId: number
}

type QueryNotesMessage = BaseWorkerMessage<QueryNotesArgs> & {
  action: SQLiteWorkerActionsEnum.QUERY_NOTES
}

type SyncNotesMessage = BaseWorkerMessage<SyncNoteEntity[]> & {
  action: SQLiteWorkerActionsEnum.SYNC_NOTES
}

type SyncNotesDeltaMessage = BaseWorkerMessage<SQLiteNotesDeltaPayload> & {
  action: SQLiteWorkerActionsEnum.SYNC_NOTES_DELTA
}

type ClearUserDataMessage = BaseWorkerMessage<undefined> & {
  action: SQLiteWorkerActionsEnum.CLEAR_USER_DATA
}

export type InsertNoteArgs = {
  connectorId: string
  userId: number
  title: string
  content?: string
  updatedAt: string
}

type InsertNoteMessage = BaseWorkerMessage<InsertNoteArgs> & {
  action: SQLiteWorkerActionsEnum.INSERT_NOTE
}

export type UpdateNoteArgs = {
  connectorId: string
  title?: string
  content?: string
  updatedAt: string
}

type UpdateNoteMessage = BaseWorkerMessage<UpdateNoteArgs> & {
  action: SQLiteWorkerActionsEnum.UPDATE_NOTE
}

export type DeleteNoteArgs = {
  connectorId: string
  userId: number
}

type DeleteNoteMessage = BaseWorkerMessage<DeleteNoteArgs> & {
  action: SQLiteWorkerActionsEnum.DELETE_NOTE
}

export type GetPendingNotesArgs = {
  userId: number
}

type GetPendingNotesMessage = BaseWorkerMessage<GetPendingNotesArgs> & {
  action: SQLiteWorkerActionsEnum.GET_PENDING_NOTES
}

export type ClearPendingSyncArgs = {
  connectorIds: string[]
}

type ClearPendingSyncMessage = BaseWorkerMessage<ClearPendingSyncArgs> & {
  action: SQLiteWorkerActionsEnum.CLEAR_PENDING_SYNC
}

export type ClearServerPendingSyncArgs = {
  connectorIds: string[]
}

type ClearServerPendingSyncMessage = BaseWorkerMessage<ClearServerPendingSyncArgs> & {
  action: SQLiteWorkerActionsEnum.CLEAR_SERVER_PENDING_SYNC
}

export type SyncNotesFromConnectorArgs = {
  notes: { connectorId: string; title: string; content: string; updatedAt: string }[]
  deleted: string[]
  userId: number
  connectorKey: string
}

type SyncNotesFromConnectorMessage = BaseWorkerMessage<SyncNotesFromConnectorArgs> & {
  action: SQLiteWorkerActionsEnum.SYNC_NOTES_FROM_CONNECTOR
}

export type GetConnectorPendingNotesArgs = {
  userId: number
  connectorKey: string
}

type GetConnectorPendingNotesMessage = BaseWorkerMessage<GetConnectorPendingNotesArgs> & {
  action: SQLiteWorkerActionsEnum.GET_CONNECTOR_PENDING_NOTES
}

export type SetConnectorSyncedForArgs = {
  connectorIds: string[]
  connectorKey: string
}

type SetConnectorSyncedForMessage = BaseWorkerMessage<SetConnectorSyncedForArgs> & {
  action: SQLiteWorkerActionsEnum.SET_CONNECTOR_SYNCED_FOR
}

export type GetConnectorSyncedNotesArgs = {
  userId: number
  connectorKey: string
}

type GetConnectorSyncedNotesMessage = BaseWorkerMessage<GetConnectorSyncedNotesArgs> & {
  action: SQLiteWorkerActionsEnum.GET_CONNECTOR_SYNCED_NOTES
}

export type GetAllNotesForExportArgs = {
  userId: number
}

type GetAllNotesForExportMessage = BaseWorkerMessage<GetAllNotesForExportArgs> & {
  action: SQLiteWorkerActionsEnum.GET_ALL_NOTES_FOR_EXPORT
}

export type RemoveStaleNotesArgs = {
  connectorIds: string[]
  userId: number
}

type RemoveStaleNotesMessage = BaseWorkerMessage<RemoveStaleNotesArgs> & {
  action: SQLiteWorkerActionsEnum.REMOVE_STALE_NOTES
}

export type WorkerMessage = 
  InsertSampleMessage
  | QueryNotesMessage
  | SyncNotesMessage
  | SyncNotesDeltaMessage
  | ClearUserDataMessage
  | InsertNoteMessage
  | UpdateNoteMessage
  | DeleteNoteMessage
  | GetPendingNotesMessage
  | ClearPendingSyncMessage
  | ClearServerPendingSyncMessage
  | SyncNotesFromConnectorMessage
  | GetConnectorPendingNotesMessage
  | SetConnectorSyncedForMessage
  | GetConnectorSyncedNotesMessage
  | GetAllNotesForExportMessage
  | RemoveStaleNotesMessage
