# DevNote — Implementation Plan

This plan orders all 18 features from `FEATURES_TO_BE_BUILT.md` into phases based on dependency analysis, risk reduction (stability first), and incremental value delivery. Each item specifies the exact files to create and modify, following the project's established patterns.

---

## Notation

- **[NEW]** — file to create
- **[MOD]** — file to modify
- **Backend pattern ref:** DDD layers, DTOs with `public readonly`, controllers validate inline, services delegate to domain, events fired after mutations
- **Frontend pattern ref:** static adapter classes returning `T | HttpError`, Redux slices with `verbNounRequest/Success/Failure/Finalized` actions, reducers in separate files spread into the slice, one middleware per flow calling `next(action)` first, hooks returning plain objects, components as arrow functions

---

## Phase 1 — Quick Wins & Stability Fixes

Small, independent items with no cross-dependencies. Each can be merged in isolation. They fix bugs and fill obvious gaps that improve day-to-day usability immediately.

---

### 1A. Update Note List After Save (Feature #16)

**Goal:** After auto-save completes, the sidebar preview list reflects changes without a refetch.

**Files:**

| File | Action |
|---|---|
| [frontend/src/modules/notes/redux/middleware/notes/update-note-by-id.middleware.ts](frontend/src/modules/notes/redux/middleware/notes/update-note-by-id.middleware.ts) | **[MOD]** In `updateNoteByIdSuccessMiddleware`, after dispatching `registerIsChangesUnsaved`, read `state.notes.notesList` and dispatch a new `updateNoteInList` action with the updated note's `id`, `title`, `updatedAt`, and `preview` fields. |
| [frontend/src/modules/notes/redux/reducer/notes/get-notes-list.reducers.ts](frontend/src/modules/notes/redux/reducer/notes/get-notes-list.reducers.ts) | **[MOD]** Add a `updateNoteInList` reducer that finds the matching note in `notesList.data` by `id` and patches `title`, `updatedAt`, `preview`. |
| [frontend/src/modules/notes/redux/slice/notes.slice.ts](frontend/src/modules/notes/redux/slice/notes.slice.ts) | **[MOD]** Export the new `updateNoteInList` action. |

**Implementation notes:**
- The `updateNoteByIdSuccess` payload is a full `NoteEntity`. Extract `id`, `title`, `updatedAt` from it.
- For `preview`, take the first ~100 chars of `content` stripped of Markdown (match whatever the backend's preview generation does, or use the raw content truncated).
- No new middleware needed — the existing `updateNoteByIdSuccessMiddleware` already fires on success; just add the dispatch.

---

### 1B. Wire Local DB Cleanup on Sign-Out / Sign-In (Feature #1)

**Goal:** Prevent user A's notes from leaking into user B's local SQLite after sign-out/sign-in.

**Files:**

| File | Action |
|---|---|
| [frontend/src/modules/auth/redux/slice/auth.slice.ts](frontend/src/modules/auth/redux/slice/auth.slice.ts) | **[MOD]** Add a `logoutRequest` action (no payload). |
| frontend/src/modules/auth/redux/middleware/auth.middleware.ts | **[MOD]** Add a `logoutFlowMiddleware` that matches `logoutRequest`, calls `clearUserData()` from `lib/sqlite.ts`, removes the token from `localStorage`, removes the `last_synced_<userId>` key, and resets auth state. |
| [frontend/src/modules/notes/redux/middleware/notes/delta-sync-notes.middleware.ts](frontend/src/modules/notes/redux/middleware/notes/delta-sync-notes.middleware.ts) | **[MOD]** In `deltaSyncNotesFlowMiddleware`, before the first sync call, call `clearUserData()` if no `last_synced_<userId>` key exists in `localStorage` (indicates fresh session for this user). |
| [frontend/src/redux/store/store.ts](frontend/src/redux/store/store.ts) | **[MOD]** Register `logoutFlowMiddleware`. |
| [frontend/src/modules/auth/hooks/use-auth-actions.ts](frontend/src/modules/auth/hooks/use-auth-actions.ts) | **[MOD]** Add a `logout()` function dispatching `logoutRequest`. |

**Implementation notes:**
- `clearUserData()` is already implemented in `lib/sqlite.ts` and returns a `Promise<void>`.
- The logout middleware should `await clearUserData()` before wiping tokens to guarantee cleanup runs before navigation.
- The `last_synced_<userId>` key format must match whatever `deltaSyncNotesFlowMiddleware` currently writes.

---

### 1C. Fix FTS Search with Special Characters (Feature #10)

**Goal:** Searches containing `:`, `"`, `-`, `^`, parentheses, or FTS5 boolean keywords don't crash SQLite.

**Files:**

| File | Action |
|---|---|
| [frontend/lib/sqlite-worker.ts](frontend/lib/sqlite-worker.ts) | **[MOD]** In the FTS5 query preprocessing logic, add a sanitisation step before appending `*`. Strip or escape characters: `"`, `:`, `^`, `(`, `)`, `{`, `}`. Replace `OR`, `AND`, `NOT` (when standalone words) with lowercase equivalents so they're treated as literals. Keep `-` only if not leading a word. |

**Implementation notes:**
- The simplest robust approach: strip all non-alphanumeric non-space characters from each word before appending `*`. This preserves the prefix-search behaviour without special-casing every FTS5 operator.
- Edge case: empty string after stripping → skip the word entirely.
- No backend changes needed.

---

### 1D. Pause Delta Sync When Tab is Idle (Feature #12)

**Goal:** Stop the 5-minute sync interval when the browser tab is hidden; resume and sync immediately on visibility restored.

**Files:**

| File | Action |
|---|---|
| [frontend/src/modules/notes/ui/notes-sync-manager/notes-sync-manager.tsx](frontend/src/modules/notes/ui/notes-sync-manager/notes-sync-manager.tsx) | **[MOD]** Add a `useEffect` that subscribes to `document.addEventListener("visibilitychange", ...)`. When `hidden`, clear the interval. When `visible`, call `performDeltaSync()` immediately and restart the interval. Store the interval ID in a `useRef` so it can be cleared and restarted from the visibility handler. |

**Implementation notes:**
- Move the `setInterval` call into a helper function so both the mount effect and the visibility handler can call it.
- Clean up the visibility listener in the effect's teardown.
- No Redux changes — this is a self-contained component change.

---

## Phase 2 — Backend Safety & Data Integrity

### 2A. Enforce Unique Note Titles per User (Feature #13)

**Goal:** Surface a user-friendly 422 when a user tries to create or rename a note to a title that already exists.

**Files:**

| File | Action |
|---|---|
| [backend/app/Notes/Presentation/Api/NoteController.php](backend/app/Notes/Presentation/Api/NoteController.php) | **[MOD]** In both `store()` and `update()` methods, add a `try/catch` around the service call for `\Illuminate\Database\QueryException`. Check if the exception code is `23505` (PostgreSQL unique violation). If so, return a 422 JSON response: `{ "errors": { "title": ["A note with this title already exists."] } }`. |
| frontend/src/modules/notes/redux/middleware/notes/create-note.middleware.ts | **[MOD]** The adapter already returns `HttpError` on 422. In `createNoteFlowMiddleware`, check if the error response contains `errors.title` and dispatch `createNoteFailure` with that message so the create-note dialog can display it inline. |

**Implementation notes:**
- The database already has a unique index on `(user_id, title)`. This change only surfaces the constraint violation as a clean API response instead of a generic 500.
- The frontend create-note dialog should display `creatingNoteError` near the title input. Check if it already does — if not, wire it.
- This must land before Note Rename (Phase 3) so that rename failures are properly surfaced.

---

## Phase 3 — Context Menu Wiring & Core Note Operations

These are medium-sized features that wire existing UI stubs to working backend operations. They depend on Phase 2 (unique title error handling) being in place.

---

### 3A. Note Rename via Context Menu (Feature #2)

**Goal:** Right-clicking a note → Rename opens an inline input; on confirm, the title is updated via the API.

**Backend — no changes needed.** The existing `PATCH /notes/:id` already accepts a `title` field with full slug validation.

**Frontend files:**

| File | Action |
|---|---|
| frontend/src/modules/notes/core/rename-note-input.ts | **[NEW]** `type RenameNoteInput = { id: number; title: string }` |
| [frontend/src/modules/notes/interface/adapters/notes.adapter.ts](frontend/src/modules/notes/interface/adapters/notes.adapter.ts) | **[MOD]** Add `static async renameNote({ id, title }: RenameNoteInput): Promise<NoteEntity \| HttpError>` — PATCHes `/notes/${id}` with `{ title }`, maps response through `NoteMapper`. |
| frontend/src/modules/notes/redux/reducer/notes/rename-note.reducers.ts | **[NEW]** Reducers: `renameNoteRequest` (sets `isRenamingNote: true`), `renameNoteSuccess` (updates `activeNote.title` if IDs match, updates matching entry in `notesList.data`), `renameNoteFailure` (stores error), `renameNoteFinalized` (clears loading). |
| [frontend/src/modules/notes/redux/slice/notes.slice.ts](frontend/src/modules/notes/redux/slice/notes.slice.ts) | **[MOD]** Import and spread `renameNoteReducers`. Add `isRenamingNote: boolean` and `renamingNoteError?: string` to `NotesState` and `initialState`. Export new actions. |
| frontend/src/modules/notes/redux/middleware/notes/rename-note.middleware.ts | **[NEW]** `renameNoteFlowMiddleware`: matches `renameNoteRequest`, calls `NotesAdapter.renameNote`, dispatches success/failure/finalized. `renameNoteSuccessMiddleware`: shows success toast. `renameNoteFailureMiddleware`: shows error toast (or surfaces `errors.title` from 422). |
| [frontend/src/redux/store/store.ts](frontend/src/redux/store/store.ts) | **[MOD]** Import and register rename middlewares. |
| [frontend/src/modules/notes/hooks/use-notes-actions.ts](frontend/src/modules/notes/hooks/use-notes-actions.ts) | **[MOD]** Add `handleRenameNote(id: number, title: string)` dispatching `renameNoteRequest`. |
| [frontend/src/modules/notes/ui/editor-file-list/editor-file-list-context-menu.tsx](frontend/src/modules/notes/ui/editor-file-list/editor-file-list-context-menu.tsx) | **[MOD]** Add a `Rename` menu item (with `Pencil` icon from lucide-react). On select, set a local `isRenaming` state (or dispatch an action to open a rename dialog). |
| frontend/src/modules/notes/ui/editor-file-list/rename-note-dialog.tsx | **[NEW]** A small dialog/popover component: input pre-filled with current title, slug validation on keystroke, confirm/cancel buttons. On confirm calls `handleRenameNote`. Displays `renamingNoteError` inline if the API returns 422. |

**Pattern adherence:**
- Reducer file is separate, spread into the slice (matches `delete-note-by-id.reducers.ts` pattern).
- Middleware calls `next(action)` first, uses `.match(action)`.
- Adapter is a static method returning `Promise<NoteEntity | HttpError>`.
- New input type lives in `core/`.
- Dialog is an arrow-function component in `ui/editor-file-list/`.

---

### 3B. Wire Share from Context Menu (Feature #4)

**Goal:** Context menu "Share" opens the share dialog for that specific note.

**Frontend files:**

| File | Action |
|---|---|
| [frontend/src/modules/notes/ui/editor-file-list/editor-file-list-context-menu.tsx](frontend/src/modules/notes/ui/editor-file-list/editor-file-list-context-menu.tsx) | **[MOD]** The Share `onClick` should dispatch an action (or call a callback prop) that opens `NoteShareDialog` with the `noteId` from the context menu's props. |

**Implementation notes:**
- The share dialog already exists and works for the active note. The only change needed is making it accept a `noteId` prop (rather than implicitly using `activeNote.id`), or dispatching `shareNoteRequest` with the `noteId` from the context menu.
- If the dialog is currently coupled to the active note, refactor it to accept `noteId` as a prop. This is a small change — likely updating a shared state or action-dialog slice to pass the target note ID.
- This is a single-file change if the dialog already accepts a note ID; otherwise 2-3 files.

---

## Phase 4 — In-App Console with Command Registry (Feature #3)

This is a new module. It follows the standard module structure.

**Goal:** A functional console panel where users type commands, see output, and can run note operations.

### Module Structure

```
frontend/src/modules/console/
├── core/
│   ├── command.type.ts              [NEW]
│   └── console-output-entry.type.ts [NEW]
├── registry/
│   ├── command-registry.ts          [NEW]
│   └── commands/
│       ├── help.command.ts          [NEW]
│       ├── clear.command.ts         [NEW]
│       ├── new-note.command.ts      [NEW]
│       ├── delete-note.command.ts   [NEW]
│       └── rename-note.command.ts   [NEW]
├── redux/
│   ├── slice/
│   │   └── console.slice.ts        [NEW]
│   ├── reducer/
│   │   └── console.reducers.ts     [NEW]
│   ├── selector/
│   │   └── console-selectors.ts    [NEW]
│   └── middleware/
│       └── console.middleware.ts    [NEW]
├── hooks/
│   └── use-console.ts              [NEW]
└── ui/
    ├── console-panel.tsx            [NEW]
    └── use-console-panel.ts         [NEW]
```

### Core Types

```ts
// core/command.type.ts
type CommandContext = {
  dispatch: AppDispatch
  getState: () => RootState
}

type Command = {
  name: string
  description: string
  execute: (args: string[], context: CommandContext) => string | Promise<string>
}
```

```ts
// core/console-output-entry.type.ts
type ConsoleOutputEntry = {
  id: string
  type: "input" | "output" | "error"
  text: string
}
```

### Command Registry

```ts
// registry/command-registry.ts
// A plain array of Command objects. Each command file exports a Command.
// The registry imports and collects them. The `help` command iterates
// this array to build its output.
```

### Redux

- **State:** `outputHistory: ConsoleOutputEntry[]`, `isConsoleOpen: boolean`
- **Actions:** `executeCommand(input: string)`, `appendOutput(entry: ConsoleOutputEntry)`, `clearOutput()`, `toggleConsole()`
- **Middleware:** `executeCommandMiddleware` — on `executeCommand`, parses the input string, looks up the command in the registry, calls `execute()`, dispatches `appendOutput` with the result. On no match, dispatches `appendOutput` with the "Unknown command" error message.

### Integration

| File | Action |
|---|---|
| [frontend/src/redux/store/store.ts](frontend/src/redux/store/store.ts) | **[MOD]** Add `console: consoleReducer` to `rootReducer`, register `executeCommandMiddleware`. |
| [frontend/src/modules/notes/ui/editor-file-list/editor-file-list-context-menu.tsx](frontend/src/modules/notes/ui/editor-file-list/editor-file-list-context-menu.tsx) | **[MOD]** Wire the Delete item to dispatch `deleteNoteByIdRequest(noteId)` directly (not through the console). |

**Pattern adherence:**
- Module structure mirrors `notes/` (core → interface → redux → hooks → ui).
- Slice follows `verbNounRequest/Success/Failure` naming where applicable.
- Middleware calls `next(action)` first.
- Console panel component is an arrow function, calls `useConsolePanel()` at the top.
- Commands are registered declaratively — adding a new command means creating a file in `commands/` and adding it to the registry array. No switch/case anywhere.

---

## Phase 5 — Application Chrome & Navigation

### 5A. Toolbar with View Switcher (Feature #7)

**Goal:** The existing empty toolbar gets Editor / Graph toggle buttons.

**Files:**

| File | Action |
|---|---|
| The existing toolbar component (find under `ui/`) | **[MOD]** Populate the `items` array with two entries: "Editor" and "Graph". Each has an icon, a label, and an `onClick` that calls `navigate` from TanStack Router. Highlight the active view based on the current route. |

**Implementation notes:**
- Use `useRouter()` or `useMatch()` from TanStack Router to determine which view is active.
- "Editor" navigates to `/dashboard/notes` (or the last `$id` route if available). "Graph" navigates to `/dashboard/nodes`.
- This is a contained UI change — no Redux or backend work needed.

---

### 5B. Application Title Bar (Feature #6)

**Goal:** A fixed top bar with logo, view switcher, note actions, and global actions.

**Files:**

| File | Action |
|---|---|
| frontend/src/modules/shared/ui/title-bar/title-bar.tsx | **[NEW]** The title bar component. Arrow function, named export. |
| frontend/src/modules/shared/ui/title-bar/use-title-bar.ts | **[NEW]** Hook that reads `activeNote`, `isNoteUpdatingMap`, `isNoteChangesUnsavedMap`, `user` from Redux selectors. Provides handlers for New, Rename, Share, Delete, Search, Sign Out. |
| The dashboard layout component | **[MOD]** Render `<TitleBar />` above the sidebar + editor grid. |

**Layout specification:**

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]  note-title    [Editor│Graph]    [+][✏️][🔗][🗑]  [🔍] [●] [User ▾]  │
└─────────────────────────────────────────────────────────────┘
│  Sidebar  │  Editor / Graph content                         │
```

- Left: Logo + active note title as clickable breadcrumb (opens rename).
- Centre: View switcher (reuses logic from 5A; if 5A was already done as part of the per-editor toolbar, move it here instead).
- Right (note actions): New, Rename, Share, Delete — disabled / hidden when `activeNote` is null.
- Right (global): Search (Alt+K), save status indicator, user menu with Sign Out.

**Implementation notes:**
- The title bar hooks into existing Redux state — no new actions needed beyond what Phases 1-4 already provide.
- Sign Out dispatches `logoutRequest` from Phase 1B.
- Save status reads `isNoteUpdatingMap[activeNote.id]` and `isNoteChangesUnsavedMap[activeNote.id]`.
- The per-note document header can be simplified (remove duplicate actions) in a follow-up cleanup.

---

## Phase 6 — Wiki-Links & Search Improvements

### 6A. Clickable Wiki-Links in Markdown Preview (Feature #5)

**Goal:** `[[id]]` references in the preview become clickable links that navigate to the referenced note.

**Files:**

| File | Action |
|---|---|
| The custom remark/rehype plugin or the Markdown preview component that replaces `[[id]]` with `[[title:id]]` | **[MOD]** Instead of rendering plain text `[[title:id]]`, render an `<a>` or `<button>` element with an `onClick` handler that calls `navigate({ to: "/dashboard/notes/$id", params: { id } })`. Style it as an internal link (e.g., underlined, distinct colour). |
| The shared-note viewer's preview component | **[MOD]** Render wiki-links as plain text (no click handler) or as links to `/shared/:sharingUrl` if the linked note is also shared. The simplest first pass is to render them as non-clickable styled spans. |

**Implementation notes:**
- The `navigate` function from TanStack Router cannot be called inside a remark/rehype plugin directly (plugins run outside React). Instead, the plugin should emit an HTML anchor with a `data-note-id` attribute, and a React wrapper should intercept clicks on those anchors and call `navigate`.
- Alternatively, use a custom React component rendered via `rehype-react` for `[[...]]` nodes.

---

### 6B. Fuzzy / Approximate Search (Feature #11)

**Goal:** Misspelled searches still return relevant notes by title.

**Files:**

| File | Action |
|---|---|
| `package.json` | **[MOD]** Add `fuse.js` as a dependency. |
| frontend/src/modules/notes/utils/fuzzy-search.ts | **[NEW]** A utility that takes a query string and an array of `{ id, title }` objects, creates a `Fuse` instance with `keys: ["title"]`, and returns ranked matches. |
| The Spotlight search hook/middleware | **[MOD]** After FTS5 results come back, run the fuzzy search on all local note titles. Merge results: FTS5 hits first (body+title match), fuzzy-only hits appended below with a visual separator ("Fuzzy matches"). De-duplicate by note ID. |

**Implementation notes:**
- Fuse.js is ~7KB gzipped, well maintained, no native deps.
- The fuzzy pass uses `localNotesList` from Redux (titles already loaded) or queries SQLite for all titles (see Feature #17).
- Keep threshold at 0.4 (default) to avoid too many false positives.

---

### 6C. Pagination on Local SQLite Title/ID Query (Feature #17)

**Goal:** The `[[` autocomplete and fuzzy search use a paginated SQLite query instead of the Redux note list.

**Files:**

| File | Action |
|---|---|
| [frontend/lib/sqlite-worker.ts](frontend/lib/sqlite-worker.ts) | **[MOD]** Add a `QUERY_TITLES` action handler: `SELECT id, title FROM notes ORDER BY updated_at DESC LIMIT ? OFFSET ?`. |
| [frontend/lib/sqlite.ts](frontend/lib/sqlite.ts) | **[MOD]** Add `queryNoteTitles(limit: number, offset: number): Promise<{ id: number; title: string }[]>`. |
| [frontend/src/core/enums/sqlite-worker-actions.enum.ts](frontend/src/core/enums/sqlite-worker-actions.enum.ts) | **[MOD]** Add `QUERY_TITLES` to the enum. |
| The Monaco `[[` completion provider | **[MOD]** Replace `localNotesList` with a call to `queryNoteTitles(50, 0)`. |

---

## Phase 7 — Command Palette

### 7A. Command Palette — Create Note (Feature #8)

**Goal:** A searchable action palette triggered by a keyboard shortcut.

**Files:**

| File | Action |
|---|---|
| frontend/src/modules/shared/ui/command-palette/command-palette.tsx | **[NEW]** A dialog component listing available actions. Text input at top filters the list. Arrow keys navigate, Enter executes. |
| frontend/src/modules/shared/ui/command-palette/use-command-palette.ts | **[NEW]** Hook managing open state, filter text, keyboard navigation, action list. Registers `Ctrl+Shift+P` (or chosen shortcut) listener. |
| frontend/src/modules/shared/redux/slice/command-palette.slice.ts | **[NEW]** State: `isOpen: boolean`. Actions: `toggleCommandPalette`. |
| [frontend/src/redux/store/store.ts](frontend/src/redux/store/store.ts) | **[MOD]** Add `commandPalette: commandPaletteReducer`. |
| The dashboard layout | **[MOD]** Render `<CommandPalette />`. |

**Initial action list:**
- "New Note" → opens create-note dialog
- "Search Notes" → opens Spotlight dialog

---

### 7B. Command Palette — Delete Note (Feature #9)

**Goal:** Add "Delete current note" to the command palette.

**Files:**

| File | Action |
|---|---|
| frontend/src/modules/shared/ui/command-palette/use-command-palette.ts | **[MOD]** Add a "Delete current note" entry to the action list, enabled only when `activeNote !== null`. On execute, dispatch `deleteNoteByIdRequest(activeNote.id)`. |

---

## Phase 8 — Large Structural Features (NOT CONSIDERED FOR IMPLEMENTATION)

> **Deprecation notice:** Phases 8A, 8B, and 8C have been decided against for the current scope of the project. The specifications below are preserved for documentation purposes only. None of these will be built.

These are the most complex items. Each is a multi-day effort spanning backend and frontend. They should be built last because they introduce new data models and UI paradigms that are easier to design once all the smaller features have stabilised the existing codebase.

---

### 8A. Folders (Feature #14) — NOT CONSIDERED FOR IMPLEMENTATION

**Backend:**

| File | Action |
|---|---|
| backend/database/migrations/xxxx_create_folders_table.php | **[NEW]** `id`, `user_id` (FK), `name` (string, 100), `parent_id` (nullable FK to self), `created_at`, `updated_at`. Unique index on `(user_id, name, parent_id)`. |
| backend/database/migrations/xxxx_add_folder_id_to_notes_table.php | **[NEW]** `folder_id` nullable FK on `notes`. |
| backend/app/Notes/Domain/Models/Folder.php | **[NEW]** Domain model. |
| backend/app/Notes/Infrastructure/Persistence/Folder.php | **[NEW]** Eloquent model with `belongsTo('parent')`, `hasMany('children')`, `hasMany('notes')`. |
| backend/app/Notes/Domain/Repositories/FolderRepositoryInterface.php | **[NEW]** Interface: `create`, `update`, `delete`, `findById`, `findByUser`. |
| backend/app/Notes/Infrastructure/Repositories/EloquentFolderRepository.php | **[NEW]** Concrete implementation. |
| backend/app/Notes/Application/DTOs/CreateFolderDTO.php | **[NEW]** `userId`, `name`, `parentId`. |
| backend/app/Notes/Application/DTOs/UpdateFolderDTO.php | **[NEW]** `name`, `parentId`. |
| backend/app/Notes/Application/Services/FolderApplicationService.php | **[NEW]** CRUD operations, validation that folder belongs to user. |
| backend/app/Notes/Presentation/Api/FolderController.php | **[NEW]** REST endpoints: `index`, `store`, `update`, `destroy`. |
| [backend/routes/api.php](backend/routes/api.php) | **[MOD]** Add `Route::apiResource('folders', FolderController::class)`. |
| backend/app/Notes/Application/DTOs/UpdateNoteDTO.php | **[MOD]** Add `public readonly ?int $folderId = null`. |
| [backend/app/Notes/Presentation/Api/NoteController.php](backend/app/Notes/Presentation/Api/NoteController.php) | **[MOD]** Accept `folder_id` in `update()` validation. |

**Frontend:**

| File | Action |
|---|---|
| frontend/src/modules/notes/core/entity/folder.entity.ts | **[NEW]** Entity type. |
| frontend/src/modules/notes/core/create-folder-input.ts | **[NEW]** Input type. |
| frontend/src/modules/notes/interface/adapters/folders.adapter.ts | **[NEW]** Static class: `getFolders`, `createFolder`, `updateFolder`, `deleteFolder`. |
| frontend/src/modules/notes/redux/slice/folders.slice.ts | **[NEW]** State, actions, reducer for folder tree. |
| frontend/src/modules/notes/redux/middleware/folders/ | **[NEW]** Middleware files for CRUD operations. |
| The sidebar file explorer component | **[MOD]** Render a tree of folders with notes as leaves. Support expand/collapse. |

---

### 8B. Note History (Feature #15) — NOT CONSIDERED FOR IMPLEMENTATION

**Backend:**

| File | Action |
|---|---|
| backend/database/migrations/xxxx_create_note_revisions_table.php | **[NEW]** `id`, `note_id` (FK), `user_id` (FK), `content` (text), `created_at`. |
| backend/app/Notes/Infrastructure/Persistence/NoteRevision.php | **[NEW]** Eloquent model. |
| backend/app/Notes/Domain/Repositories/NoteRevisionRepositoryInterface.php | **[NEW]** Interface. |
| backend/app/Notes/Infrastructure/Repositories/EloquentNoteRevisionRepository.php | **[NEW]** Concrete. |
| backend/app/Notes/Application/Services/NoteApplicationService.php | **[MOD]** In `updateNote()`, before writing the new content, insert the previous content into `note_revisions`. |
| [backend/app/Notes/Presentation/Api/NoteController.php](backend/app/Notes/Presentation/Api/NoteController.php) | **[MOD]** Add `getHistory(int $noteId)` and `getRevision(int $noteId, int $revisionId)` endpoints. |
| [backend/routes/api.php](backend/routes/api.php) | **[MOD]** Add `GET /notes/{id}/history` and `GET /notes/{id}/history/{revisionId}`. |

**Frontend:**

| File | Action |
|---|---|
| frontend/src/modules/notes/core/entity/note-revision.entity.ts | **[NEW]** |
| frontend/src/modules/notes/interface/adapters/notes.adapter.ts | **[MOD]** Add `getNoteHistory`, `getNoteRevision` static methods. |
| frontend/src/modules/notes/ui/note-history/ | **[NEW]** History panel component: list of revisions, preview pane, restore button. |

---

### 8C. Folder Navigation via CLI-Style Commands (Feature #18) — NOT CONSIDERED FOR IMPLEMENTATION

**Depends on:** Phase 4 (Console) + Phase 8A (Folders).

**Goal:** Register `mkdir`, `touch`, `cd` commands in the console's command registry.

**Files:**

| File | Action |
|---|---|
| frontend/src/modules/console/registry/commands/mkdir.command.ts | **[NEW]** Calls `FoldersAdapter.createFolder()`. |
| frontend/src/modules/console/registry/commands/touch.command.ts | **[NEW]** Calls `NotesAdapter.createNote()` with `folderId` from current folder context. |
| frontend/src/modules/console/registry/commands/cd.command.ts | **[NEW]** Updates a `currentFolderId` in console state. |
| frontend/src/modules/console/registry/command-registry.ts | **[MOD]** Import and register the three new commands. |

**Implementation notes:**
- Each command file exports a single `Command` object.
- Adding them to the registry array automatically makes them appear in `help` output.
- The `cd` command needs a `currentFolderId` concept in the console slice state, defaulting to `null` (root).

---

## Implementation Order Summary

| Order | Feature # | Name | Size | Dependencies |
|-------|----------|------|------|--------------|
| 1 | 16 | Update note list after save | S | — |
| 2 | 1 | Local DB cleanup on sign-out/in | S | — |
| 3 | 10 | FTS special character fix | S | — |
| 4 | 12 | Pause delta sync when idle | S | — |
| 5 | 13 | Enforce unique note titles | S | — |
| 6 | 2 | Note rename (context menu) | M | #13 |
| 7 | 4 | Share from context menu | S | — |
| 8 | 3 | In-App console + command registry | L | #2 (rename cmd) |
| 9 | 7 | Toolbar view switcher | S | — |
| 10 | 6 | Application title bar | M | #1, #2, #4, #7 |
| 11 | 5 | Clickable wiki-links | M | — |
| 12 | 11 | Fuzzy search | S | — |
| 13 | 17 | SQLite title pagination | S | — |
| 14 | 8 | Command palette — create | M | — |
| 15 | 9 | Command palette — delete | S | #8 |
| 16 | 14 | Folders | L | — | ~~NOT CONSIDERED~~ |
| 17 | 15 | Note history | L | — | ~~NOT CONSIDERED~~ |
| 18 | 18 | CLI folder commands | M | #3, #14 | ~~NOT CONSIDERED~~ |

**Size key:** S = a few hours, M = ~1 day, L = multi-day.
