import { SQLiteWorkerActionsEnum } from "../src/core/enums/sqlite-worker-actions.enum.js";
import {
  WorkerMessage,
  QueryNotesArgs,
} from "../src/core/types/sqlite-worker-messages.type.js";
import { SQLiteNotesDeltaPayload } from "../src/core/types/sqlite-notes-delta-payload.type.js";
import { SyncNoteEntity } from "../src/modules/notes/core/entity/sync-note.entity.js";
import { cleanMarkdown } from "../src/utils/clean-markdown.js";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqlite3: any = null;

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { action, payload } = event.data;

  try {
    await initDb();

    switch (action) {
      case SQLiteWorkerActionsEnum.INSERT_SAMPLE:
        await handleInsertSample(payload);
        self.postMessage({ success: true });
        break;

      case SQLiteWorkerActionsEnum.QUERY_NOTES:
        self.postMessage({
          success: true,
          results: await handleQueryNotes(payload),
        });
        break;

      case SQLiteWorkerActionsEnum.SYNC_NOTES_DELTA:
        await handleSyncNotesDelta(payload);
        self.postMessage({ success: true });
        break;

      case SQLiteWorkerActionsEnum.SYNC_NOTES: 
        await handleSyncNotes(payload);
        self.postMessage({ success: true });
        break;

      case SQLiteWorkerActionsEnum.CLEAR_USER_DATA:
        await handleClearUserData();
        self.postMessage({ success: true });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

async function handleClearUserData(): Promise<void> {
  db.exec("BEGIN TRANSACTION");
  try {
    db.exec({ sql: "DELETE FROM notes" });

    db.exec({ sql: "DELETE FROM notes_fts" });

    db.exec("COMMIT");

    db.exec("VACUUM");

    self.postMessage({ success: true });
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

async function handleInsertSample(payload: SyncNoteEntity): Promise<void> {
  const note = payload;
  const searchableText = payload.content ? await cleanMarkdown(payload.content, {}, payload.title) : "";
  db.exec({
    sql: "INSERT OR REPLACE INTO notes (id, user_id, title, content, searchable_text, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    bind: [
      note.id,
      note.userId,
      note.title || "",
      note.content || "",
      searchableText,
      note.updatedAt || "",
    ],
  });
  db.exec({
    sql: "INSERT INTO notes_fts(rowid, searchable_text) VALUES (?, ?)",
    bind: [note.id, searchableText],
  });
}

async function handleQueryNotes(
  payload: QueryNotesArgs
): Promise<SyncNoteEntity[]> {
  const { searchTerm, userId } = payload;

  if (!searchTerm || searchTerm.trim() === "") {
    // If search term is empty, return all notes for the user, ordered by most recently updated
    const results = db.exec({
      sql: `
        SELECT *
        FROM notes
        WHERE user_id = ?
        ORDER BY updated_at DESC
      `,
      bind: [userId],
      returnValue: "resultRows",
    });
    return results;
  }

  const processed = preprocessSearchTerm(searchTerm);

  if (!processed) {
    const results = db.exec({
      sql: `
        SELECT *
        FROM notes
        WHERE user_id = ?
        ORDER BY updated_at DESC
      `,
      bind: [userId],
      returnValue: "resultRows",
    });
    return results;
  }

  const results = db.exec({
    sql: `
    SELECT
      n.*
    FROM notes_fts
    JOIN notes n ON notes_fts.rowid = n.rowid
    WHERE notes_fts MATCH ? AND n.user_id = ?
    ORDER BY rank
  `,
    bind: [processed, userId],
    returnValue: "resultRows",
  });

  return results;
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

  const noteTitleMap: Record<number, string> = {};

  for (const note of payload.notes) {
    noteTitleMap[note.id] = note.title;
  }

  try {
    for (const note of notes) {
      // skipping to prevent leaks
      if (note.userId !== userId) continue;

      const searchableText = note.content
        ? await cleanMarkdown(note.content, noteTitleMap, note.title)
        : "";

      db.exec({
        sql: "INSERT OR REPLACE INTO notes (id, user_id, title, content, searchable_text, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        bind: [
          note.id,
          note.userId,
          note.title || "",
          note.content || "",
          searchableText,
          note.updatedAt || "",
        ],
      });

      const rowid = await db.selectValue("SELECT last_insert_rowid()");
      db.exec({
        sql: "INSERT INTO notes_fts(rowid, searchable_text) VALUES (?, ?)",
        bind: [rowid, searchableText || ""],
      });
    }

    for (const id of deleted) {
      db.exec({
        sql: "DELETE FROM notes WHERE id = ? AND user_id = ?",
        bind: [id, userId],
      });

      db.exec({
        sql: "DELETE FROM notes_fts WHERE rowid = ?",
        bind: [id],
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

  const noteTitleMap: Record<number, string> = {};

  for (const note of payload) {
    noteTitleMap[note.id] = note.title;
  }

  try {
    for (const note of payload) {
      const searchableText = note.content
        ? await cleanMarkdown(note.content, noteTitleMap, note.title)
        : "";

      db.exec({
        sql: "INSERT OR REPLACE INTO notes (id, user_id, title, content, searchable_text, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        bind: [
          note.id,
          note.userId,
          note.title || "",
          note.content || "",
          searchableText,
          note.updatedAt || "",
        ],
      });

      const rowid = await db.selectValue("SELECT last_insert_rowid()");
      db.exec({
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

async function loadWasmBinary(url) {
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

async function initDb() {
  if (db) return;

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
    vfs: ["opfs", "idb"], // OPFS first, IndexedDB fallback
  });

  try {
    db = new sqlite3.oo1.OpfsDb("/notes.db"); // Persistent via OPFS
    console.log("OPFS initialized successfully");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    console.warn("OPFS failed, falling back to IndexedDB");
    db = new sqlite3.oo1.JsiDb("/notes.db"); // IndexedDB fallback
  }

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      title TEXT,
      content TEXT,
      searchable_text TEXT,
      updated_at TEXT
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(searchable_text, content='notes', content_rowid='id');
    CREATE INDEX IF NOT EXISTS idx_notes_search ON notes(searchable_text);
  `);
}
