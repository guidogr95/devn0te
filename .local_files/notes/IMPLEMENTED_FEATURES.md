# DevNote — Implemented Features

---

## 1. Authentication

### User Registration
A new user can sign up with a name, email, password, and password confirmation. On success, the user is automatically logged in and redirected to the dashboard. Validation errors (duplicate email, weak password, etc.) return field-level error messages.

### User Login
A user signs in with email and password. On success, a Bearer token is stored in `localStorage` and used for all subsequent API requests.

### Token Verification on Load
When the app loads, it reads any stored token and calls the API to confirm it is still valid. If valid, the user is redirected to the dashboard. If invalid, the token is removed and the user is sent to login.

### Protected Routes
All dashboard routes require authentication. The login page is hidden when the user is already authenticated. Route guards handle both directions automatically.

---

## 2. Note Management

### Create Note
A new note is created by entering a title in a dialog (opened via a button or the `Alt+N` keyboard shortcut). The title is validated as a slug: alphanumeric, hyphens, and underscores only, max 50 characters, no leading/trailing/consecutive hyphens. On success the new note becomes the active note and the editor opens.

### View & Edit Note (Monaco Editor)
The active note opens in a Monaco editor configured for Markdown. Changes are debounced for 2 seconds then automatically saved to the server via a `PATCH` request. If new changes arrive before the previous save completes, the in-flight request is cancelled via `AbortController` and a fresh save is issued.

### Live Markdown Preview (Split Pane)
The editor renders a live Markdown preview in a side-by-side pane. The preview supports GitHub Flavoured Markdown (GFM) and syntax-highlighted code blocks via `rehype-highlight`.

### Save State Indicator
A status indicator in the document header shows **Saved**, **Saving…**, **Unsaved changes** (with a pulsing warning), or **Deleting…** depending on the current network operation state.

### Delete Note
A note can be deleted from a dropdown menu in the document header. After deletion a toast confirmation is shown, the active note is cleared, and the user is returned to the empty editor state. The backend records a deletion tombstone row in the `deleted_notes` table so the local SQLite database can be updated during the next delta sync.

### Paginated Note List with Sort
The sidebar shows a paginated list of note previews. The list can be sorted by **Created At** or **Updated At** in ascending or descending order. Scrolling to the bottom of the list loads the next page (infinite scroll).

### Note Context Menu (Stub)
Right-clicking a note in the sidebar shows a context menu with Copy, Share, and Delete options. These items currently log to the console and are not yet wired to actions.

---

## 3. Note Sharing

### Share Note
A note's sharing mode can be set to **Public**, **Password Protected**, or **Private** from the document header menu. Selecting "Share" opens a dialog where the user chooses the access level and optionally sets a password (3–20 characters, required for password-protected mode). On save, a share link is generated and displayed with a copy-to-clipboard button.

### Public Shared Note Viewer
Any user (unauthenticated) can visit a `/shared/:sharingUrl` URL to view a note. The page fetches the note by its sharing URL. If the note is password-protected, a password prompt dialog is shown before the content is revealed.

---

## 4. Wiki-Style Note References

### `[[id]]` Link Syntax
Inside the Monaco editor, typing `[[` triggers an autocomplete dropdown that suggests all of the user's note titles. Selecting a title inserts `[[noteId]]` into the content.

### Reference Rendering in Preview
The live Markdown preview and the Spotlight search preview resolve all `[[id]]` references and display them as `[[title:id]]` using a pre-fetched link map, making references human-readable as you type.

### Note Links Graph
The backend parses `[[id]]` references from note content on every create and update event, records links in a `note_links` table, removes stale links, and exposes them via `GET /user/notes/links`. The frontend calls this endpoint and the data is available for the wiki-link graph view.

### Notes Graph View
A dedicated route (`/dashboard/nodes`) renders a graph visualisation of all note-to-note links. Node and edge data comes from the `GET /user/notes/links` endpoint.

---

## 5. Local SQLite Sync (Offline-capable search)

### Delta Sync
A headless `NotesSyncManager` component triggers a delta sync on mount and every 5 minutes while the user is on the dashboard. The sync calls `GET /user/notes/delta?last_sync=<timestamp>`, receives changed and deleted note IDs, and writes the diff into a local SQLite database stored in the browser's OPFS (Origin Private File System), with IndexedDB as a fallback. The timestamp of the last successful sync is stored in `localStorage`.

### Local SQLite Database
The database runs inside a Web Worker using the `sqlite3-wasm` binary. It holds a `notes` table and a `notes_fts` virtual FTS5 table with a `searchable_text` column. Content is stripped of Markdown syntax before indexing so searches match plain prose, not markup characters.

### FTS5 Full-Text Search
The Spotlight Search dialog queries the local SQLite FTS5 index. Searches are debounced (500 ms) and the query is preprocessed to append `*` to each word for prefix matching. Results are ranked by relevance.

### Clear Local Data
A `clearUserData()` function wipes all rows from `notes` and `notes_fts`, runs `VACUUM`, and `ROLLBACK`s on failure. This is intended to be used on sign-out to prevent one user's data from being visible to another.

---

## 6. Spotlight Search

### Search Dialog
Opened with the `Alt+K` shortcut or the search button in the sidebar. Shows a search input and a split layout: left shows matched note titles; right shows a live Markdown preview of the highlighted result.

### Keyboard Navigation
While the search dialog is open, `↑` / `↓` moves the selection through results, and `Enter` opens the selected note and closes the dialog.

---

## 7. Dashboard & Layout

### Dashboard Layout
The authenticated dashboard renders a sidebar (`FileExplorer`) and a main content area. The sidebar contains the note list, sort controls, a new-file button, the Spotlight search trigger, and the file creation dialog.

### Note Editor Empty State
When no note is selected, a placeholder message is shown in the main area.

### Header Time Ago
The document header displays a human-readable "Last updated X ago" timestamp that refreshes every 3 minutes.

---

## 8. Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/register` | Register a new user |
| `POST` | `/api/v1/login` | Login, returns Bearer token |
| `GET` | `/api/v1/user` | Get current user from token |
| `GET` | `/api/v1/notes` | Paginated note list (sortable) |
| `POST` | `/api/v1/notes` | Create note |
| `GET` | `/api/v1/note/:id` | Get single note by ID |
| `PATCH` | `/api/v1/notes/:id` | Update note content |
| `DELETE` | `/api/v1/notes/:id` | Delete note (records tombstone) |
| `POST` | `/api/v1/notes/:id/share` | Set sharing mode and password |
| `GET` | `/api/v1/user/notes/preview` | Paginated note preview list |
| `GET` | `/api/v1/user/notes/titles` | Paginated note titles (for autocomplete) |
| `GET` | `/api/v1/user/notes/links` | All note-to-note links for the user |
| `GET` | `/api/v1/user/notes/sync` | All notes since a given timestamp (full sync) |
| `GET` | `/api/v1/user/notes/delta` | Notes changed and IDs deleted since a timestamp (delta sync) |
| `GET` | `/api/v1/shared-notes/:sharingUrl` | Public note view (no auth required) |

---

## Known Stubs / Partially Implemented

- **Note context menu actions** — Copy, Share, Delete items exist in the UI but are not wired to any action.
- **Note title editing in the editor** — The title input in the editor updates local state only; saving the new title is not implemented.
- **Editor toolbar / menu bar** — The toolbar component exists and renders but the items array is empty.
- **Shared note content rendering** — The shared note viewer shows title and metadata but the note content display is commented out.
- **Local data cleanup on sign-out** — `clearUserData()` exists in `sqlite.ts` but is not called anywhere in the auth flow.
