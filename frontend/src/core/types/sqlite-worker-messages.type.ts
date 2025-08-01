import { SyncNoteEntity } from "devnote/modules/notes/core/entity/sync-note.entity";
import { SQLiteWorkerActionsEnum } from "../enums/sqlite-worker-actions.enum";
import { GetDeltaNotesValueObject } from "devnote/modules/notes/core/get-delta-notes-value-object";

type BaseWorkerMessage<T> = {
  action: SQLiteWorkerActionsEnum
  payload: T
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

type SyncNotesDeltaMessage = BaseWorkerMessage<GetDeltaNotesValueObject> & {
  action: SQLiteWorkerActionsEnum.SYNC_NOTES_DELTA
}

type ClearUserDataMessage = BaseWorkerMessage<undefined> & {
  action: SQLiteWorkerActionsEnum.CLEAR_USER_DATA
}

export type WorkerMessage = 
  InsertSampleMessage
  | QueryNotesMessage
  | SyncNotesMessage
  | SyncNotesDeltaMessage
  | ClearUserDataMessage
