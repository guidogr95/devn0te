# PLAN-devnotes-features-2

Feature work derived from `.local_files/devnotes.md` (second pass).
All design questions resolved. Ready to implement in order.

---

## Item 1 — Search result match highlighting

**What:** While searching, each result row in the left-side list and the preview pane should visually highlight the portions of text that match the current search term.

**Current state:**
- `spotlight-content.tsx` renders each result title as a plain string (`{result.title}.md`).
- The preview pane feeds raw note content into `ReactMarkdown` via `useRenderPreview`, with no injection of highlight markers.
- `localQuerySearchTerm` is already in Redux state and available everywhere in `SpotlightContent`.

**Approach:**

### 1a — Title row highlights
- Add a small `highlightText(text: string, query: string): ReactNode` pure function inside `spotlight-content.tsx` (not a utility file — used only here).
- Algorithm: split `text` on occurrences of each token from `query` (case-insensitive), return alternating `<span>` / `<mark>` elements.
- Replace `<span className="truncate">{result.title}.md</span>` with `{highlightText(result.title, localQuerySearchTerm)}<span className="opacity-50">.md</span>`.
- `<mark>` style: `className="bg-yellow-400/30 text-yellow-200 rounded-sm px-0.5"` — dim enough that it doesn't compete with the green active-row highlight.

### 1b — Preview pane highlights
- **Do not** preprocess the raw Markdown string. String-replacing Markdown source with `<mark>` tags before parsing will corrupt syntax whenever the search term appears inside `**bold**`, a code fence, a link URL, or any other Markdown construct.
- Instead, use a **custom inline rehype plugin** added to the `rehypePlugins` array passed to `ReactMarkdown`. The plugin runs *after* Markdown is fully parsed into HTML AST, then visits only `text` nodes and splits them on the search pattern, inserting `element` nodes of type `<mark>` for each match.
- This is safe: code blocks, link targets, and Markdown syntax nodes are different AST node types — the visitor never touches them.
- The plugin is created inline and memoized with `useMemo` so it only regenerates when `localQuerySearchTerm` changes.
- `unist-util-visit` is already a transitive dep of `remark`/`rehype`.
- Style: CSS class `search-highlight` on each `<mark>`.
- Guard: pass `null` for the plugin slot when `localQuerySearchTerm` is empty.

**Files:**
- `frontend/src/modules/notes/ui/spotlight-search/spotlight-content.tsx`
- `frontend/src/styles/` or `monaco-editor.css` for the `.search-highlight` rule

---

## Item 2 — NotePreview panel: improvements + minimize

**What:** The floating `NotePreview` card shown when a node is clicked in the graph view needs to be more useful and gain a minimize state.

### Current state audit
- `note-preview.tsx` receives a `LocalNoteEntity` (has: `id`, `title`, `userId`, `updatedAt`, `content`).
- Maximize (`SquareIcon`) and close (`X`) buttons exist. Minimize is missing.
- Action buttons (Edit, Copy, Share, Delete, ExternalLink) are all stubs with `console.log` only — none are wired.
- The Links tab (`outgoingNotes`, `incomingNotes`) is entirely empty — the arrays are hardcoded `[]`.
- The Details tab shows `updatedAt` twice — `createdAt` is not available in the entity.
- The metadata row shows a hardcoded `100px` placeholder for word count.
- `handleNodeDoubleClick` calls `handleSetActiveNoteId(parseInt(data.id))` but doesn't set active note in a way that the preview knows about; clicking a node only navigates the URL to `/{-$id}`.

### What a user would want to do in the node view
1. **Navigate to the editor to edit the note** — most common intent.
2. **See which notes link to this one and navigate to them** — graph users think in connections.
3. **Copy the note content or title quickly** — useful without leaving the graph.
4. **Delete the note** — destructive action, needs confirmation.
5. **Minimize the panel** — keep the graph visible while the card stays accessible.

### Planned improvements

**2a — Minimize state**
- Add a third window state: `"normal"` | `"minimized"` | `"maximized"`.
- Minimized: card collapses to just the `CardHeader` row (title + three buttons). The content/tabs/actions are hidden.
- Icon: `Minus` (lucide), between the maximize and close buttons.
- Persist nothing — state is ephemeral per session.

**2b — Wire action buttons**
- **Edit (ExternalLink):** `navigate({ to: "/dashboard/notes/$id", params: { id: String(note.id) } })` — opens the note in the editor view.
- **Copy:** keep the existing `navigator.clipboard.writeText(note.content)` pattern but add a transient `copied!` label using a local `useState<boolean>` flag that resets after 1500 ms.
- **Delete:** open the existing `DeleteNoteDialog` with the note. `NotePreview` needs to accept an `onDelete` callback prop that fires `handleDeleteNoteById` + `onClose`. This keeps deletion logic in the parent.
- **Share:** wire to the same `showToast` / `createShareNoteDialogContent` pattern already used in `useTitleBar`.
- Remove the stub `console.log` handlers.

**2c — Fix Links tab**
- The `graphEdges` representing `[[notelinks]]` are computed in `NotesGraph` and stored in component state (`graphEdges`). Pass them as a prop to `NotePreview`.
- In `NotePreview`, filter `edges` for rows where `source === String(note.id)` (outgoing) or `target === String(note.id)` (incoming).
- Resolve labels from `localNotesList` (pass as prop too, or use `useSelector` inside the component).
- Each link row: clicking it navigates the graph to that node (`navigate({ to: "/dashboard/nodes/{-$id}", params: { "-$id": linkedId } })`).

**2d — Fix Details tab**
- Replace the hardcoded `100px` with `{note.content.split(/\s+/).filter(Boolean).length} words` (already done but unused).
- Remove the second `updatedAt` "Created" row or replace with a note that `createdAt` is unavailable.

**Files:**
- `frontend/src/modules/nodes/ui/note-preview/note-preview.tsx`
- `frontend/src/modules/nodes/ui/notes-graph/notes-graph.tsx` (pass `edges` + `localNotesList` as props to `NotePreview`)

---

## Item 3 — Unsaved-changes browser close warning

**What:** If the user tries to close the tab or navigate away from the browser while a note save is in progress (or changes are unsaved), show the native browser "leave site?" confirmation.

**Current state:**
- `isNoteUpdating` (save in flight) and `isChangesUnsaved` (debounced dirty flag) are both already computed in `useTitleBar` from Redux selectors `selectIsNoteUpdatingMap` and `selectIsChangesUnsavedMap`.
- No `beforeunload` handler exists anywhere.

**Approach:**
- Create a small hook `useBeforeUnloadGuard(shouldGuard: boolean)` placed in `frontend/src/modules/notes/hooks/`.
- The hook registers a `window.addEventListener("beforeunload", handler)` when `shouldGuard` is true, and removes it on cleanup or when the flag becomes false.
- The handler sets `event.preventDefault()` and `event.returnValue = ""` (the cross-browser pattern for triggering the native dialog).
- Mount this hook in a layout-level component that lives for the entire session. The best candidate is the dashboard layout, which already wraps both editor and graph views. Read `isChangesUnsaved` and `isNoteUpdating` from Redux directly.

**Files:**
- `frontend/src/modules/notes/hooks/use-before-unload-guard.ts` (new)
- `frontend/src/layouts/dashboard-layout.tsx` (mount the hook)

---

## Item 4 — Fix graph node auto-highlight on first load

**What:** When the graph view loads with an `id` URL param (e.g. navigating from editor → graph), the active node is not highlighted. The `useEffect` that calls `setSelections` and `centerGraph` runs before `reagraph` has finished its internal layout/render cycle, so the canvas ref methods are no-ops.

**Root cause:**
```ts
useEffect(() => {
  if (activeNoteId) {
    setSelections([activeNoteId]);
    graphRef.current?.centerGraph([activeNoteId]);
  }
}, []); // runs once, immediately — canvas may not be ready
```

**Approach:**
- Replace the single fire-once effect with a `useEffect` that listens to `graphRef.current` readiness.
- reagraph's `GraphCanvas` fires an `onLayoutFinished` callback once the layout engine completes the first pass. Wire `onLayoutFinished` on `<GraphCanvas>` to a local piece of state `const [layoutReady, setLayoutReady] = useState(false)`.
- The effect depends on `[layoutReady, activeNoteId]` — it will re-run once the layout finishes:
  ```ts
  useEffect(() => {
    if (!layoutReady || !activeNoteId) return;
    setSelections([activeNoteId]);
    graphRef.current?.centerGraph([activeNoteId]);
  }, [layoutReady, activeNoteId]);
  ```
- This guarantees the canvas is ready before selection and centering are attempted, without polling or arbitrary timeouts.

**Files:**
- `frontend/src/modules/nodes/ui/notes-graph/notes-graph.tsx`

---

## Implementation Order

| # | Item | Complexity |
|---|------|------------|
| 1 | Item 4 — graph auto-highlight fix | XS |
| 2 | Item 3 — browser close guard | XS |
| 3 | Item 1a — search title highlights | S |
| 4 | Item 1b — search preview highlights | S |
| 5 | Item 2a — NotePreview minimize | XS |
| 6 | Item 2b — NotePreview wire actions | S |
| 7 | Item 2c — NotePreview links tab | M |
| 8 | Item 2d — NotePreview details fix | XS |
