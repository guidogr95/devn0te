# DevNote — Features To Be Built

Items extracted from the plan outline. Each item includes the current state and what needs to be done.

---

## 1. Wire Local DB Cleanup on Sign-Out / Sign-In

**Current state:**  
`clearUserData()` exists in `lib/sqlite.ts` and deletes all rows from `notes` + `notes_fts`, then runs `VACUUM`. It is never called.

**What to build:**  
Call `clearUserData()` as part of the sign-out flow, before wiping the auth token. On sign-in (when a token is confirmed valid), call `clearUserData()` again before the first delta sync completes to ensure no leftover data from a previous session contaminates the new session. The last-sync timestamp keyed on the previous `userId` must also be removed from `localStorage`.

---

## 2. Note Rename

**Current state:**  
The context menu `Rename` item exists in `EditorFileListContextMenu` but its `onSelect` handler is a no-op. The title input in `NoteEditorTitle` updates component state only and does not issue any API call.

**What to build:**  
Rename is triggered exclusively from the context menu. Selecting Rename should open an inline input (or a small dialog) pre-filled with the current note title, which is a slug-style unique identifier (`alphanumeric`, hyphens, underscores, max 50 chars, no leading/trailing/consecutive hyphens). On confirm, issue a `PATCH /notes/:id` call with the new title. If the backend returns a 422 (duplicate title or invalid format), display the error inline. On success, update the note entry in the Redux note-list slice and the local SQLite row so the sidebar reflects the new title immediately without a refetch. The `NoteEditorTitle` display should also update to show the new title.

---

## 3. In-App Console with Command Registry

**Current state:**  
The frontend has an existing console component that renders a panel but has no functional command processing — no input is evaluated, no output is produced.

**What to build:**  
Build out the console into a fully functional in-app command console. The core requirements are:

- **Command registry:** Commands are registered in a central list. Each entry has a `name` (the keyword the user types), a `description` (one sentence explaining what the command does), optional `arguments`, and an `execute` function. No hard-coded switch/case — all commands must live in this registry.
- **Command execution and output:** When the user types a command and presses Enter, the console matches the input against the registry, runs the `execute` function, and prints the returned output to the console panel.
- **Unrecognised command feedback:** If the input does not match any registered command, the console prints `"Unknown command: <name>. Type 'help' to see available commands."`
- **`help` command:** A built-in `help` command reads through the registry and prints each command's `name` and `description`. No manual maintenance is needed — adding a new command to the registry automatically makes it appear in `help` output.
- **Delete note command:** Register a `delete <noteTitle>` command. When executed with a valid title, it dispatches `deleteNoteByIdRequest` for the matching note, triggering the existing delete middleware (API call, confirmation toast, clear active note if it was the deleted one). If the title does not match any note the console prints a descriptive error.
- **Context menu wire-up:** The context menu `Delete` item should invoke the same underlying delete action directly (dispatch `deleteNoteByIdRequest`) rather than going through the console. The console command and the context menu are two separate entry points to the same middleware.

Initial commands to register (beyond `help` and `delete`):
- `clear` — clears the console output history
- `new <noteTitle>` — creates a new note, equivalent to the Alt+N flow
- `rename <oldTitle> <newTitle>` — renames a note by title

---

## 4. Wire Share Note from Context Menu

**Current state:**  
The context menu `Share` item exists but its `onSelect` handler is a no-op.

**What to build:**  
Clicking Share from the context menu should open the share dialog (`NoteShareDialog`) for the note corresponding to that context menu, even if that note is not the currently open note. Thread the `noteId` from the context menu item into the dialog open action.

---

## 5. Clickable Wiki-Links in Markdown Preview

**Current state:**  
The live preview renders `[[id]]` as `[[title:id]]` plain text. There is no navigation when clicking a reference.

**What to build:**  
Replace the text representation with a clickable element that, when clicked, navigates to `/dashboard/notes/:id` using the TanStack Router `navigate` function. On the shared-note viewer page, these links should either be disabled or navigate to the public viewer for the linked note.

---

## 6. Application Title Bar

**Current state:**  
No application-level title bar exists. The dashboard header is a plain layout row inside the editor area only. Actions like share, delete, and rename are buried in per-component menus with no consistent top-level surface.

**What to build:**  
Add a fixed title bar that spans the full application width and sits above both the sidebar and the editor. This is a pure web component — no Electron or Tauri bindings. Suggested layout and contents:

- **Left zone:** App logo / name. Below or adjacent to it, a breadcrumb showing the current note title (if one is open), clicking the title opens the inline rename flow (see item 2).
- **Centre zone:** View-switcher toggle — two states: **Editor** (navigates to `/dashboard/notes/:id` or the empty editor) and **Graph** (navigates to `/dashboard/nodes`). Displays which view is currently active.
- **Right zone — note actions (active only when a note is open):**
  - **New** — opens the create-note dialog (same as Alt+N)
  - **Rename** — opens the inline rename flow for the current note
  - **Share** — opens `NoteShareDialog` for the current note
  - **Delete** — triggers the delete confirmation flow for the current note
- **Right zone — global actions:**
  - **Search** — opens the Spotlight search dialog (same as Alt+K)
  - **Save status indicator** — reuses the existing Saved / Saving… / Unsaved / Deleting… indicator, moved here from the per-note header so it is always visible
  - **User menu** — displays the signed-in user's name or avatar; dropdown contains a Sign Out action

The existing per-note header below the title bar can be simplified or removed once its actions are promoted to the title bar. All note action buttons in the title bar must be disabled / hidden when no note is open.

---

## 7. Toolbar with View Switcher

**Current state:**  
The editor toolbar component exists and renders but the `items` array is empty. The graph view at `/dashboard/nodes` is a separate route reachable only by direct URL.

**What to build:**  
Populate the toolbar with at least one control: a toggle between "Editor" view (`/dashboard/notes/:id`) and "Graph" view (`/dashboard/nodes`). Selecting "Graph" from the toolbar should navigate to the graph view; selecting "Editor" returns to the last-opened note or the empty editor state.

---

## 8. Command Palette — Create Note

**Current state:**  
A create-note dialog exists and can be opened with `Alt+N`. There is no general command palette.

**What to build:**  
Add a command palette (triggered by `Cmd+P` / `Ctrl+P` or a defined shortcut). The palette should have an item "New Note" that opens the existing create-note dialog. The palette must be accessible from any dashboard view.

---

## 9. Command Palette — Delete Note

**Current state:**  
Delete is only accessible from the document header menu.

**What to build:**  
Add a "Delete current note" action to the command palette. It should be active only when a note is open. Triggering it should go through the same confirmation flow as the header menu delete.

---

## 10. Fix FTS Search with Special Characters (`:` and others)

**Current state:**  
The search preprocessor in `lib/sqlite.ts` appends `*` to each word. If the user's query contains FTS5 operator characters (`:`, `"`, `-`, `^`, `OR`, `AND`, `NOT`, parentheses), the raw query is passed to SQLite, which either throws an error or produces unexpected results.

**What to build:**  
Sanitise or escape the query before passing it to FTS5. Options include stripping known FTS5 special characters, wrapping the entire query in double-quotes, or using the `fts5_tokenizer` `simple` mode with a custom normaliser. Cover the `:` case at a minimum and add regression tests for common edge inputs.

---

## 11. Fuzzy / Approximate Search

**Current state:**  
Search relies entirely on FTS5 prefix matching (`word*`). A misspelled word returns zero results.

**What to build:**  
Augment (or replace in the UI presentation) FTS5 results with approximate title matching. A lightweight implementation would run a second pass over note titles using a JS fuzzy-match library (e.g. `fuse.js`) and merge results ranked by score. The FTS5 content search remains for body text; fuzzy matching improves title discoverability.

---

## 12. Pause Delta Sync When Tab is Idle

**Current state:**  
`NotesSyncManager` runs `setInterval` every 5 minutes unconditionally.

**What to build:**  
Add a Page Visibility API listener. Pause the interval when `document.visibilityState` is `"hidden"` and restart it when the tab becomes visible again. On resume, issue an immediate sync before restarting the interval so the client catches up without waiting a full 5 minutes.

---

## 13. Enforce Unique Note Titles per User

**Current state:**  
The client validates the title format (slug rules) but does not check for uniqueness. The database has a unique index on `(user_id, title)` in the `notes` table but the application layer does not surface a user-friendly error when that constraint fires.

**What to build:**  
In `NoteService` (or the create/update controller), catch the unique-constraint database exception and return a descriptive 422 response (`"A note with this title already exists."`). On the frontend, display the error message in the form field rather than showing a generic error toast.

---

## 14. Folders -> Note to be implementedz

**Current state:**  
All notes are flat. There is no folder concept anywhere in the UI or data model.

**What to build:**  
- **Backend:** Add a `folders` table (`id`, `user_id`, `name`, `parent_id` nullably). Add a `folder_id` nullable foreign key on `notes`. Create endpoints: `POST /folders`, `GET /folders`, `PATCH /folders/:id`, `DELETE /folders/:id`, `PATCH /notes/:id` (add `folder_id` to the update DTO).  
- **Frontend:** Render folder nodes in the sidebar file explorer tree. Allow creating, renaming, and deleting folders. Allow dragging (or context-menu moving) notes into folders. The note list and delta sync must respect `folder_id`.

---

## 15. Note History

**Current state:**  
No version history exists. A note's content is overwritten on every PATCH.

**What to build:**  
- **Backend:** Add a `note_revisions` table (`id`, `note_id`, `user_id`, `content`, `created_at`). On every `PATCH /notes/:id`, insert a snapshot of the *previous* content into `note_revisions` before writing the new content. Add `GET /notes/:id/history` returning a paginated list of revisions and `GET /notes/:id/history/:revisionId` returning a specific revision's content.  
- **Frontend:** Add a "History" option to the document header menu. Opening it shows a list of past revisions with timestamps. Selecting a revision shows a read-only diff or a preview of the full content at that point in time, with a "Restore" action that sets the editor content to that revision (triggering a new save).

---

## 16. Update Note List After Save

**Current state:**  
After a note is saved (content or title), the sidebar preview list is not updated. The change is reflected only after a page reload or re-navigation.

**What to build:**  
When the auto-save middleware receives a successful `updateNoteSuccess` response, dispatch an action to update the matching note entry in the Redux note-list slice (`updatedAt`, `preview` / title). The list UI re-renders immediately from the updated Redux state without requiring a refetch.

---

## 17. Pagination on Local SQLite Title / ID Query

**Current state:**  
The `[[` autocomplete uses `localNotesList` loaded from Redux, which itself is a flat list of all notes loaded so far via infinite scroll. For large vaults this list may be incomplete (only the currently loaded pages) or slow to render all options in the Monaco autocomplete popup.

**What to build:**  
Replace the Redux-state list with a direct SQLite query against the local notes table (similar to `queryNotes` but selecting `id` and `title`, sorted by `updated_at` DESC, with a `LIMIT` of 50 and optional `OFFSET` for pagination). Wire this to the Monaco completion provider so the results are always fresh from the local DB even when only a few pages have been loaded into Redux.

---

## 18. Folder Navigation via CLI-Style Commands

**Current state:**  
No CLI-style command palette commands exist. Folders do not exist yet.

**What to build:**  
After folders are implemented (item 14), add the following commands to the command palette:
- `mkdir <folder>` — creates a new folder at the current location
- `touch <file>` — creates a new note in the current folder (equivalent to `Alt+N` but folder-aware)
- `cd <folder>` — navigates the sidebar to the specified folder, with tab-completion against existing folder names
