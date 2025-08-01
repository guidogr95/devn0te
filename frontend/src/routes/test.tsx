import { createFileRoute } from "@tanstack/react-router";
import { initSQLite, insertSampleNote, queryNotes, syncNotesFromServer } from "../../lib/sqlite";
import { NotesAdapter } from "devnote/modules/notes/interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";

export const Route = createFileRoute("/test")({
  component: () => {
    const handleTest = async () => {
      const db = await initSQLite();
      await insertSampleNote({
        id: 1,
        userId: 2,
        title: "Test Note",
        searchableText: "Hello world",
        updatedAt: new Date().toISOString(),
      });
      // const results = await queryNotes("world"); // Or 'wor*' for FTS fuzzy
      // console.log(results);
    };

    const handleTestSync = async () => {
      const db = await initSQLite();

      const lastSync = localStorage.getItem("last_sync") || "";

      const response = await NotesAdapter.getNotesForSync(lastSync);

      if (isHttpError(response)) {
        return;
      }

      await syncNotesFromServer(response);
      // const results = await queryNotes(""); // Or 'wor*' for FTS fuzzy
      // console.log(results);
    };


    return <>
    <button onClick={handleTest}>Test SQLite</button>;
    <button onClick={handleTestSync}>Test Sync</button>;
    </>;
  },
});
