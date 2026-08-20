import { SQLiteWorkerActionsEnum } from "../src/core/enums/sqlite-worker-actions.enum.js";
import {
  WorkerMessage,
  QueryNotesArgs,
  InsertNoteArgs,
  UpdateNoteArgs,
  DeleteNoteArgs,
  GetPendingNotesArgs,
  ClearPendingSyncArgs,
  ClearServerPendingSyncArgs,
  SyncNotesFromConnectorArgs,
  GetConnectorPendingNotesArgs,
  SetConnectorSyncedForArgs,
  GetConnectorSyncedNotesArgs,
  GetAllNotesForExportArgs,
  RemoveStaleNotesArgs,
} from "../src/core/types/sqlite-worker-messages.type.js";
import { SQLiteNotesDeltaPayload } from "../src/core/types/sqlite-notes-delta-payload.type.js";
import { SyncNoteEntity } from "../src/modules/notes/core/entity/sync-note.entity.js";
import { LocalNoteEntity } from "../src/modules/notes/core/entity/local-note-entity.js";
import { cleanMarkdown } from "../src/utils/clean-markdown.js";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqlite3: any = null;

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { action, payload, requestId } = event.data;
  
  try {
    await initDb();

    switch (action) {
      case SQLiteWorkerActionsEnum.INSERT_SAMPLE:
        await handleInsertSample(payload);
        self.postMessage({ success: true, requestId });
        break;

      case SQLiteWorkerActionsEnum.QUERY_NOTES:

        self.postMessage({
          success: true,
          requestId,
          results: await handleQueryNotes(payload),
        });
        break;

      case SQLiteWorkerActionsEnum.SYNC_NOTES_DELTA:
        await handleSyncNotesDelta(payload);
        self.postMessage({ success: true, requestId });
        break;

      case SQLiteWorkerActionsEnum.SYNC_NOTES: 

        await handleSyncNotes(payload);
        self.postMessage({ success: true, requestId });
        break;

      case SQLiteWorkerActionsEnum.CLEAR_USER_DATA:
        await handleClearUserData();
        self.postMessage({ success: true, requestId });
        break;

      case SQLiteWorkerActionsEnum.INSERT_NOTE: {
        const localId = await handleInsertNote(payload as InsertNoteArgs);
        self.postMessage({ success: true, requestId, localId });
        break;
      }

      case SQLiteWorkerActionsEnum.UPDATE_NOTE:
        await handleUpdateNote(payload as UpdateNoteArgs);
        self.postMessage({ success: true, requestId });
        break;

      case SQLiteWorkerActionsEnum.DELETE_NOTE:
        await handleDeleteNote(payload as DeleteNoteArgs);
        self.postMessage({ success: true, requestId });
        break;

      case SQLiteWorkerActionsEnum.GET_PENDING_NOTES: {
        const result = await handleGetPendingNotes(payload as GetPendingNotesArgs);
        self.postMessage({ success: true, requestId, result });
        break;
      }

      case SQLiteWorkerActionsEnum.CLEAR_PENDING_SYNC:
        await handleClearPendingSync(payload as ClearPendingSyncArgs);
        self.postMessage({ success: true, requestId });
        break;

      case SQLiteWorkerActionsEnum.CLEAR_SERVER_PENDING_SYNC:
        await handleClearServerPendingSync(payload as ClearServerPendingSyncArgs);
        self.postMessage({ success: true, requestId });
        break;

      case SQLiteWorkerActionsEnum.SYNC_NOTES_FROM_CONNECTOR:
        await handleSyncNotesFromConnector(payload as SyncNotesFromConnectorArgs);
        self.postMessage({ success: true, requestId });
        break;

      case SQLiteWorkerActionsEnum.GET_CONNECTOR_PENDING_NOTES: {
        const result = await handleGetConnectorPendingNotes(payload as GetConnectorPendingNotesArgs);
        self.postMessage({ success: true, requestId, result });
        break;
      }

      case SQLiteWorkerActionsEnum.SET_CONNECTOR_SYNCED_FOR:
        await handleSetConnectorSyncedFor(payload as SetConnectorSyncedForArgs);
        self.postMessage({ success: true, requestId });
        break;

      case SQLiteWorkerActionsEnum.GET_CONNECTOR_SYNCED_NOTES: {
        const result = await handleGetConnectorSyncedNotes(payload as GetConnectorSyncedNotesArgs);
        self.postMessage({ success: true, requestId, result });
        break;
      }

      case SQLiteWorkerActionsEnum.GET_ALL_NOTES_FOR_EXPORT: {
        const result = await handleGetAllNotesForExport(payload as GetAllNotesForExportArgs);
        self.postMessage({ success: true, requestId, result });
        break;
      }

      case SQLiteWorkerActionsEnum.REMOVE_STALE_NOTES:
        await handleRemoveStaleNotes(payload as RemoveStaleNotesArgs);
        self.postMessage({ success: true, requestId });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    self.postMessage({
      success: false,
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

async function handleClearUserData(): Promise<void> {
  await db.exec("BEGIN TRANSACTION");
  try {
    await db.exec({ sql: "DELETE FROM notes" });
    await db.exec({ sql: "DELETE FROM notes_fts" });
    await db.exec({ sql: "DELETE FROM pending_deletes" });
    await db.exec("COMMIT");
    await db.exec("VACUUM");
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }
}

async function handleInsertNote(payload: InsertNoteArgs): Promise<number> {
  const searchableText = payload.content ? await cleanMarkdown(payload.content, payload.title) : "";
  await db.exec({
    sql: "INSERT INTO notes (user_id, title, content, searchable_text, updated_at, connector_id, pending_sync, pending_action) VALUES (?, ?, ?, ?, ?, ?, 1, 'create')",
    bind: [
      payload.userId,
      payload.title,
      payload.content ?? "",
      searchableText,
      payload.updatedAt,
      payload.connectorId,
    ],
  });
  const localId = await db.selectValue("SELECT last_insert_rowid()") as number;
  await db.exec({
    sql: "INSERT INTO notes_fts (rowid, searchable_text) VALUES (?, ?)",
    bind: [localId, searchableText],
  });
  return localId;
}

async function handleUpdateNote(payload: UpdateNoteArgs): Promise<void> {
  const rows = await db.exec({
    sql: "SELECT id, title, content FROM notes WHERE connector_id = ?",
    bind: [payload.connectorId],
    returnValue: "resultRows",
  }) as unknown[][];
  if (!rows.length) return;
  const [noteId, currentTitle, currentContent] = rows[0];
  const newTitle = payload.title !== undefined ? payload.title : (currentTitle as string);
  const newContent = payload.content !== undefined ? payload.content : (currentContent as string);
  const searchableText = newContent ? await cleanMarkdown(newContent, newTitle) : "";
  await db.exec({
    sql: "UPDATE notes SET title = ?, content = ?, searchable_text = ?, updated_at = ?, pending_sync = 1, pending_action = 'update', connector_synced_for = NULL WHERE connector_id = ?",
    bind: [newTitle, newContent, searchableText, payload.updatedAt, payload.connectorId],
  });
  await db.exec({ sql: "DELETE FROM notes_fts WHERE rowid = ?", bind: [noteId] });
  await db.exec({
    sql: "INSERT INTO notes_fts (rowid, searchable_text) VALUES (?, ?)",
    bind: [noteId, searchableText],
  });
}

async function handleDeleteNote(payload: DeleteNoteArgs): Promise<void> {
  const rows = await db.exec({
    sql: "SELECT id, pending_sync, pending_action, connector_synced_for FROM notes WHERE connector_id = ? AND user_id = ?",
    bind: [payload.connectorId, payload.userId],
    returnValue: "resultRows",
  }) as unknown[][];
  if (!rows.length) return;
  const [noteId, pendingSync, pendingAction, connectorSyncedFor] = rows[0];
  await db.exec({ sql: "DELETE FROM notes_fts WHERE rowid = ?", bind: [noteId] });
  await db.exec({ sql: "DELETE FROM notes WHERE id = ?", bind: [noteId] });
  const isPendingCreate = pendingSync === 1 && pendingAction === "create";
  if (!isPendingCreate) {
    await db.exec({
      sql: "INSERT OR REPLACE INTO pending_deletes (connector_id, user_id, server_id, created_at, connector_synced_for) VALUES (?, ?, ?, ?, ?)",
      bind: [payload.connectorId, payload.userId, noteId, new Date().toISOString(), connectorSyncedFor ?? null],
    });
  }
}

async function handleGetPendingNotes(payload: GetPendingNotesArgs) {
  const notes = await db.exec({
    sql: "SELECT id, user_id, title, content, updated_at, connector_id, pending_action FROM notes WHERE pending_sync = 1 AND user_id = ?",
    bind: [payload.userId],
    returnValue: "resultRows",
  }) as unknown[][];
  const deletes = await db.exec({
    sql: "SELECT connector_id, server_id FROM pending_deletes WHERE user_id = ?",
    bind: [payload.userId],
    returnValue: "resultRows",
  }) as unknown[][];
  return {
    notes: notes.map(row => ({
      id: row[0] as number,
      userId: row[1] as number,
      title: (row[2] as string) || "",
      content: (row[3] as string) || "",
      updatedAt: (row[4] as string) || "",
      connectorId: (row[5] as string) || "",
      pendingAction: (row[6] as string) || "update",
    })),
    deletes: deletes.map(row => ({
      connectorId: (row[0] as string) || "",
      serverId: row[1] as number,
    })),
  };
}

async function handleClearPendingSync(payload: ClearPendingSyncArgs): Promise<void> {
  for (const connectorId of payload.connectorIds) {
    await db.exec({ sql: "UPDATE notes SET pending_sync = 0 WHERE connector_id = ?", bind: [connectorId] });
    await db.exec({ sql: "DELETE FROM pending_deletes WHERE connector_id = ? AND (connector_synced_for IS NOT NULL OR connector_synced_for IS NULL)", bind: [connectorId] });
  }
}

async function handleClearServerPendingSync(payload: ClearServerPendingSyncArgs): Promise<void> {
  for (const connectorId of payload.connectorIds) {
    await db.exec({ sql: "UPDATE notes SET pending_sync = 0, pending_action = 'update' WHERE connector_id = ?", bind: [connectorId] });
    await db.exec({ sql: "DELETE FROM pending_deletes WHERE connector_id = ? AND connector_synced_for IS NULL", bind: [connectorId] });
  }
}

async function handleSyncNotesFromConnector(payload: SyncNotesFromConnectorArgs): Promise<void> {
  const { notes, deleted, userId, connectorKey } = payload;

  await db.exec("BEGIN TRANSACTION");
  try {
    for (const note of notes) {
      const searchableText = note.content ? await cleanMarkdown(note.content, note.title) : "";

      const existing = await db.exec({
        sql: "SELECT id, updated_at, pending_sync FROM notes WHERE connector_id = ?",
        bind: [note.connectorId],
        returnValue: "resultRows",
      }) as unknown[][];

      if (existing.length > 0) {
        const [noteId, existingUpdatedAt, pendingSync] = existing[0];
        if (pendingSync === 1) continue;
        if (new Date(note.updatedAt).getTime() <= new Date(existingUpdatedAt as string).getTime()) continue;
        await db.exec({
          sql: "UPDATE notes SET title = ?, content = ?, searchable_text = ?, updated_at = ?, connector_synced_for = ? WHERE id = ?",
          bind: [note.title, note.content, searchableText, note.updatedAt, connectorKey, noteId],
        });
        await db.exec({ sql: "DELETE FROM notes_fts WHERE rowid = ?", bind: [noteId] });
        await db.exec({
          sql: "INSERT INTO notes_fts (rowid, searchable_text) VALUES (?, ?)",
          bind: [noteId, searchableText],
        });
      } else {
        await db.exec({
          sql: "INSERT INTO notes (user_id, title, content, searchable_text, updated_at, connector_id, connector_synced_for) VALUES (?, ?, ?, ?, ?, ?, ?)",
          bind: [userId, note.title, note.content, searchableText, note.updatedAt, note.connectorId, connectorKey],
        });
        const newId = await db.selectValue("SELECT last_insert_rowid()") as number;
        await db.exec({
          sql: "INSERT INTO notes_fts (rowid, searchable_text) VALUES (?, ?)",
          bind: [newId, searchableText],
        });
      }
    }

    for (const connectorId of deleted) {
      const rows = await db.exec({
        sql: "SELECT id, pending_sync FROM notes WHERE connector_id = ?",
        bind: [connectorId],
        returnValue: "resultRows",
      }) as unknown[][];
      for (const [noteId, pendingSync] of rows) {
        if (pendingSync === 1) continue;
        await db.exec({ sql: "DELETE FROM notes_fts WHERE rowid = ?", bind: [noteId] });
        await db.exec({ sql: "DELETE FROM notes WHERE id = ?", bind: [noteId] });
      }
      await db.exec({ sql: "DELETE FROM pending_deletes WHERE connector_id = ? AND connector_synced_for = ?", bind: [connectorId, connectorKey] });
    }

    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }
}

async function handleGetConnectorPendingNotes(payload: GetConnectorPendingNotesArgs) {
  const { userId, connectorKey } = payload;
  const notes = await db.exec({
    sql: "SELECT id, user_id, title, content, updated_at, connector_id, pending_action FROM notes WHERE (connector_synced_for IS NULL OR connector_synced_for != ?) AND user_id = ?",
    bind: [connectorKey, userId],
    returnValue: "resultRows",
  }) as unknown[][];
  const deletes = await db.exec({
    sql: "SELECT connector_id, server_id FROM pending_deletes WHERE user_id = ? AND connector_synced_for IS NOT NULL",
    bind: [userId],
    returnValue: "resultRows",
  }) as unknown[][];
  return {
    notes: notes.map(row => ({
      id: row[0] as number,
      userId: row[1] as number,
      title: (row[2] as string) || "",
      content: (row[3] as string) || "",
      updatedAt: (row[4] as string) || "",
      connectorId: (row[5] as string) || "",
      pendingAction: (row[6] as string) || "update",
    })),
    deletes: deletes.map(row => ({
      connectorId: (row[0] as string) || "",
      serverId: row[1] as number,
    })),
  };
}

async function handleSetConnectorSyncedFor(payload: SetConnectorSyncedForArgs): Promise<void> {
  const { connectorIds, connectorKey } = payload;
  for (const connectorId of connectorIds) {
    await db.exec({
      sql: "UPDATE notes SET connector_synced_for = ? WHERE connector_id = ?",
      bind: [connectorKey, connectorId],
    });
    await db.exec({
      sql: "DELETE FROM pending_deletes WHERE connector_id = ? AND connector_synced_for = ?",
      bind: [connectorId, connectorKey],
    });
  }
}

async function handleGetConnectorSyncedNotes(payload: GetConnectorSyncedNotesArgs): Promise<{ connectorId: string; title: string }[]> {
  const { userId, connectorKey } = payload;
  const rows = await db.selectObjects(
    "SELECT connector_id, title FROM notes WHERE user_id = ? AND connector_synced_for = ?",
    [userId, connectorKey]
  ) as { connector_id: string; title: string }[];
  return rows.map(r => ({ connectorId: r.connector_id, title: r.title }));
}

async function handleGetAllNotesForExport(payload: GetAllNotesForExportArgs): Promise<{ connectorId: string; title: string; content: string; updatedAt: string }[]> {
  const { userId } = payload;
  const rows = await db.selectObjects(
    "SELECT connector_id, title, content, updated_at FROM notes WHERE user_id = ?",
    [userId]
  ) as { connector_id: string; title: string; content: string; updated_at: string }[];
  return rows.map(r => ({
    connectorId: r.connector_id,
    title: r.title ?? "",
    content: r.content ?? "",
    updatedAt: r.updated_at ?? "",
  }));
}

async function handleRemoveStaleNotes(payload: RemoveStaleNotesArgs): Promise<void> {
  const { connectorIds, userId } = payload;
  for (const connectorId of connectorIds) {
    const rows = await db.exec({
      sql: "SELECT id FROM notes WHERE connector_id = ? AND user_id = ?",
      bind: [connectorId, userId],
      returnValue: "resultRows",
    }) as unknown[][];
    if (!rows.length) continue;
    const noteId = rows[0][0];
    await db.exec({ sql: "DELETE FROM notes_fts WHERE rowid = ?", bind: [noteId] });
    await db.exec({ sql: "DELETE FROM notes WHERE id = ?", bind: [noteId] });
  }
}

async function handleInsertSample(payload: SyncNoteEntity): Promise<void> {
  const note = payload;
  const searchableText = payload.content ? await cleanMarkdown(payload.content, payload.title) : "";
  await db.exec({
    sql: "INSERT OR REPLACE INTO notes (id, user_id, title, content, searchable_text, updated_at, connector_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    bind: [
      note.id,
      note.userId,
      note.title || "",
      note.content || "",
      searchableText,
      note.updatedAt || "",
      note.connectorId || "",
    ],
  });
  await db.exec({
    sql: "INSERT INTO notes_fts(rowid, searchable_text) VALUES (?, ?)",
    bind: [note.id, searchableText],
  });
}

function mapNoteRow(r: Record<string, unknown>): LocalNoteEntity {
  return {
    id: r.id as number,
    userId: r.user_id as number,
    title: (r.title as string) ?? "",
    content: (r.content as string) ?? "",
    searchableText: (r.searchable_text as string) ?? "",
    updatedAt: (r.updated_at as string) ?? "",
    connectorId: (r.connector_id as string) ?? "",
  };
}

async function handleQueryNotes(
  payload: QueryNotesArgs
): Promise<LocalNoteEntity[]> {
  const { searchTerm, userId } = payload;

  if (!searchTerm || searchTerm.trim() === "") {
    const rows = await db.selectObjects(
      "SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC",
      [userId]
    ) as Record<string, unknown>[];

    return rows.map(mapNoteRow);
  }

  const processed = preprocessSearchTerm(searchTerm);

  if (!processed) {
    const rows = await db.selectObjects(
      "SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC",
      [userId]
    ) as Record<string, unknown>[];
    return rows.map(mapNoteRow);
  }

  const rows = await db.selectObjects(
    "SELECT n.* FROM notes_fts JOIN notes n ON notes_fts.rowid = n.rowid WHERE notes_fts MATCH ? AND n.user_id = ? ORDER BY rank",
    [processed, userId]
  ) as Record<string, unknown>[];


  return rows.map(mapNoteRow);
}

function preprocessSearchTerm(raw: string): string {
  return raw
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(word => `${word}*`)
    .join(' ');
}



async function handleSyncNotesDelta(
  payload: SQLiteNotesDeltaPayload
): Promise<void> {
  const { notes, deleted, userId } = payload;

  await db.exec("BEGIN TRANSACTION");

  try {
    for (const note of notes) {
      if (note.userId !== userId) continue;

      const pending = await db.exec({
        sql: "SELECT pending_sync FROM notes WHERE connector_id = ?",
        bind: [note.connectorId],
        returnValue: "resultRows",
      }) as unknown[][];
      if (pending.length > 0 && pending[0][0] === 1) continue;

      const searchableText = note.content
        ? await cleanMarkdown(note.content, note.title)
        : "";

      await db.exec({
        sql: "DELETE FROM notes_fts WHERE rowid IN (SELECT id FROM notes WHERE connector_id = ? AND id != ?)",
        bind: [note.connectorId, note.id],
      });
      await db.exec({
        sql: "DELETE FROM notes WHERE connector_id = ? AND id != ?",
        bind: [note.connectorId, note.id],
      });

      await db.exec({
        sql: "INSERT OR REPLACE INTO notes (id, user_id, title, content, searchable_text, updated_at, connector_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        bind: [
          note.id,
          note.userId,
          note.title || "",
          note.content || "",
          searchableText,
          note.updatedAt || "",
          note.connectorId || "",
        ],
      });

      const rowid = await db.selectValue("SELECT last_insert_rowid()");
      await db.exec({
        sql: "INSERT INTO notes_fts(rowid, searchable_text) VALUES (?, ?)",
        bind: [rowid, searchableText || ""],
      });
    }

    for (const id of deleted) {
      const rows = await db.exec({
        sql: "SELECT pending_sync FROM notes WHERE id = ? AND user_id = ?",
        bind: [id, userId],
        returnValue: "resultRows",
      }) as unknown[][];
      if (!rows.length || rows[0][0] === 1) continue;

      await db.exec({
        sql: "DELETE FROM notes_fts WHERE rowid = ?",
        bind: [id],
      });

      await db.exec({
        sql: "DELETE FROM notes WHERE id = ? AND user_id = ?",
        bind: [id, userId],
      });
    }

    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }
}

async function handleSyncNotes(payload: SyncNoteEntity[]): Promise<void> {
  await db.exec("BEGIN TRANSACTION");

  try {
    for (const note of payload) {
      const searchableText = note.content
        ? await cleanMarkdown(note.content, note.title)
        : "";

      await db.exec({
        sql: "INSERT OR REPLACE INTO notes (id, user_id, title, content, searchable_text, updated_at, connector_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        bind: [
          note.id,
          note.userId,
          note.title || "",
          note.content || "",
          searchableText,
          note.updatedAt || "",
          note.connectorId || "",
        ],
      });

      const rowid = await db.selectValue("SELECT last_insert_rowid()");
      await db.exec({
        sql: "INSERT INTO notes_fts(rowid, searchable_text) VALUES (?, ?)",
        bind: [rowid, searchableText],
      });
    }
    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }
}

async function loadWasmBinary(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch WASM: ${response.status} ${response.statusText}`
    );
  }
  return await response.arrayBuffer();
}

async function loadSqliteScript(url: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch SQLite script: ${response.status} ${response.statusText}`
    );
  }
  const scriptText = await response.text();

  eval(scriptText);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (self as any).sqlite3InitModule === "undefined") {
    throw new Error("sqlite3InitModule not found after loading script");
  }
}

let initPromise: Promise<void> | null = null;

async function initDb() {
  if (db) return;
  if (initPromise) {
    try { await initPromise; } catch { initPromise = null; }
    if (db) return;
  }
  initPromise = doInitDb();
  try { await initPromise; }
  catch (e) { initPromise = null; throw e; }
}

async function doInitDb() {

  let wasmBinary;
  try {
    await loadSqliteScript("/sqlite-wasm/sqlite3.js");

    wasmBinary = await loadWasmBinary("/sqlite-wasm/sqlite3.wasm");
  } catch (e) {
    console.error("WASM load failed:", e);
    throw e;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sqlite3 = await (self as any).sqlite3InitModule({
    wasmBinary,
    vfs: ["opfs", "idb"],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let localDb: any;
	try {
		localDb = new sqlite3.oo1.OpfsDb("/notes.db");
	} catch {
    console.warn("OPFS failed, falling back to IndexedDB");
    localDb = new sqlite3.oo1.JsiDb("/notes.db");
  }

  localDb.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      title TEXT,
      content TEXT,
      searchable_text TEXT,
      updated_at TEXT,
      connector_id TEXT
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(searchable_text, content='notes', content_rowid='id');
    CREATE INDEX IF NOT EXISTS idx_notes_search ON notes(searchable_text);
  `);

  const version = localDb.selectValue("PRAGMA user_version") as number;
  if (version < 1) {
    try {
      localDb.exec("ALTER TABLE notes ADD COLUMN connector_id TEXT");
    } catch {
      // column already exists on fresh installs
    }
    localDb.exec("PRAGMA user_version = 1");
  }
  if (version < 2) {
    try {
      localDb.exec("ALTER TABLE notes ADD COLUMN pending_sync INTEGER DEFAULT 0");
    } catch {
      // column already exists
    }
    try {
      localDb.exec("ALTER TABLE notes ADD COLUMN pending_action TEXT DEFAULT 'update'");
    } catch {
      // column already exists
    }
    localDb.exec(`
      CREATE TABLE IF NOT EXISTS pending_deletes (
        connector_id TEXT PRIMARY KEY,
        user_id INTEGER,
        server_id INTEGER,
        created_at TEXT
      )
    `);
    localDb.exec("PRAGMA user_version = 2");
  }
  if (version < 3) {
    try {
      localDb.exec("ALTER TABLE notes ADD COLUMN connector_synced_for TEXT DEFAULT NULL");
    } catch {
      // column already exists
    }
    try {
      localDb.exec("ALTER TABLE pending_deletes ADD COLUMN connector_synced_for TEXT DEFAULT NULL");
    } catch {
      // column already exists
    }
    localDb.exec("PRAGMA user_version = 3");
  }

  db = localDb;
}
