import { SQLiteWorkerActionsEnum } from "devnote/core/enums/sqlite-worker-actions.enum";
import { SQLiteNotesDeltaPayload } from "devnote/core/types/sqlite-notes-delta-payload.type";
import { QueryNotesArgs, WorkerMessage } from "devnote/core/types/sqlite-worker-messages.type";
import { LocalNoteEntity } from "devnote/modules/notes/core/entity/local-note-entity";
import { SyncNoteEntity } from "devnote/modules/notes/core/entity/sync-note.entity";


let worker: Worker | null = null;

export async function initSQLite(): Promise<void> {
  getWorker();
}

export async function insertSampleNote(note: SyncNoteEntity): Promise<void> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    w.onmessage = (event) => {
      if (event.data.success) resolve();
      else reject(new Error(event?.data?.error));
    };

    postMessageToWorker({
      action: SQLiteWorkerActionsEnum.INSERT_SAMPLE,
      payload: note
    });
  });
}

export async function clearUserData(): Promise<void> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    w.onmessage = (event) => {
      if (event.data.success) resolve();
      else reject(new Error(event?.data?.error));
    };

    postMessageToWorker({
      action: SQLiteWorkerActionsEnum.CLEAR_USER_DATA,
      payload: undefined
    });
  });
}

export async function queryNotes(options: QueryNotesArgs): Promise<LocalNoteEntity[]> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    w.onmessage = (event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (event.data.success) resolve(event.data.results.map((row: any[]) => ({
        id: row[0],
        userId: row[1],
        title: row[2],
        searchableText: row[3],
        updatedAt: row[4],
        preview: row[5]
      })));
      else reject(new Error(event.data.error));
    };

    postMessageToWorker({
      action: SQLiteWorkerActionsEnum.QUERY_NOTES,
      payload: options
    });
  });
}

export async function syncNotesDelta(notesDelta: SQLiteNotesDeltaPayload): Promise<void> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    w.onmessage = (event) => {
      if (event.data.success) resolve();
      else reject(new Error(event.data.error));
    };

    postMessageToWorker({
      action: SQLiteWorkerActionsEnum.SYNC_NOTES_DELTA,
      payload: notesDelta
    });
  });
}

export async function syncNotesFromServer(notes: SyncNoteEntity[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    w.onmessage = (event) => {
      if (event.data.success) resolve();
      else reject(new Error(event.data.error));
    };

    postMessageToWorker({
      action: SQLiteWorkerActionsEnum.SYNC_NOTES,
      payload: notes
    });
  });
}


function postMessageToWorker(message: WorkerMessage): void {
  const w = getWorker();
  w.postMessage(message);
}


function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./sqlite-worker.ts", import.meta.url), { type: "module" });
  }
  return worker;
}
