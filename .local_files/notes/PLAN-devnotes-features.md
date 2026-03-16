# PLAN-devnotes-features

Feature work derived from `.local_files/devnotes.md`.  
All design questions resolved. Ready to implement in order.

---

## Item 1 — Highlight active node in graph view

**What:** When the nodes route loads with an `id` URL param, that node must be selected in the reagraph canvas exactly as if the user had clicked it.

**Root cause:** `useSelection` inside `Graph` starts with empty `selections`. Nothing seeds it on mount from the URL param.

**Approach:**
- Pass `defaultSelections={[activeNoteId]}` to `useSelection`. This seeds the hook's internal state on first render, producing the same ring/path-glow as a real click.
- Call `graphRef.current?.centerGraph([activeNoteId])` in a `useEffect(() => ..., [])` so the camera centers on the node on mount.
- The `activeNoteId` available in `NotesGraph` (from the URL param) must be forwarded down to `Graph` as a prop.

**Files:**
- `frontend/src/modules/nodes/ui/notes-graph/notes-graph.tsx`

---

## Item 2 — Node view → editor: preserve active note via view switcher

**What:** When the user is in the graph/nodes view and uses the TitleBar view switcher to go to "editor", the last active note must open in the editor rather than landing on a blank editor.

**Root cause:** `handleNavigateEditor` in `use-title-bar.ts` navigates to `/dashboard/notes` (no ID). `useNoteEditorWrapper` reads `id` from URL params; with no ID the wrapper never calls `handleGetNoteById`, so nothing loads.

**Fix:** Update `handleNavigateEditor` to navigate to `/dashboard/notes/${activeNote.id}` when `activeNote` is set:

```ts
const handleNavigateEditor = useCallback(() => {
  if (activeNote) {
    navigate({ to: Routes.dashboard.children.notes.params.$id, params: { id: String(activeNote.id) } });
    return;
  }
  navigate({ to: Routes.dashboard.children.notes.path });
}, [navigate, activeNote]);
```

**Files:**
- `frontend/src/modules/shared/ui/title-bar/use-title-bar.ts`

---

## Item 3 — Fix wiki-link navigation (navigates to current note instead of target)

**Root cause (confirmed):**
`use-note-editor-wrapper.ts` — the fetch `useEffect` guard:

```ts
if (!activeNote || activeNote?.id !== activeNoteId) {
  handleGetNoteById(id);
}
```

When `activeNote` already exists and `activeNote.id === activeNoteId`, the condition is `false` — a URL param change from clicking a wiki-link never triggers a new fetch.

**Fix:**

```ts
useEffect(() => {
  if (!id) return;
  if (activeNote?.id === id) return;
  handleGetNoteById(id);
}, [id]);
```

**Files:**
- `frontend/src/modules/notes/ui/note-editor-wrapper/use-note-editor-wrapper.ts`

---

## Item 4 — Editor view toggle: editor-only / split / preview-only

**What:** Three view modes. Currently always 50/50 split.

**Position:** A compact 3-button icon group rendered inside `MonacoNoteEditor` directly above the `ResizablePanelGroup`. Keeps the control adjacent to the content it affects; same row pattern as the existing Monaco toolbar.

**Persistence:** `localStorage` via a small internal hook so the selected mode survives navigation and page reloads. Not Redux (UI preference, not shareable state).

**Modes:** `"split"` (default) | `"editor"` | `"preview"`.

**Approach:**
- Hook `useEditorViewMode` reads/writes `localStorage` key `"editor-view-mode"`.
- For `"editor"` and `"preview"` modes, replace `ResizablePanelGroup` with a plain `div` for the single-panel case — avoids ResizableHandle artefacts.
- Toggle UI: three icon-only buttons (`Columns2`, `Code2`, `Eye` from lucide), styled as `border border-gray-600 rounded-sm overflow-hidden` (same as the TitleBar view switcher). Active mode gets `bg-green-700 text-gray-900`.

**Files:**
- `frontend/src/modules/notes/ui/note-editor-wrapper/monaco-editor/monaco-note-editor.tsx`

---

## Item 5 — TitleBar: Tooltip labels + fix focus-visible ring

### 5a — Tooltip labels
Wrap each icon `Button` in the TitleBar with `TooltipProvider` / `Tooltip` / `TooltipTrigger` / `TooltipContent` — identical to the pattern used in `ExplorerActions.tsx`.
Include shortcut hints in tooltip text where applicable: `"New note (Alt+N)"`, `"Search (Alt+K)"`, etc.

### 5b — Fix focus-visible ring
The default shadcn `Button` applies `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`. The `--ring` CSS variable resolves to a blue-gray inconsistent with the terminal aesthetic.

**Fix:** Add `focus-visible:ring-0` to the `className` of every TitleBar icon `Button`. Targeted — no global side effects.

**Files:**
- `frontend/src/modules/shared/ui/title-bar/title-bar.tsx`

---

## Item 6 — Search button fix + Command palette TitleBar drawer

### 6a — Fix SpotlightSearch trigger button

**Root cause:** `SpotlightSearch` uses `DialogTrigger` on a controlled Dialog. Clicking fires `onOpenChange(true)` which `handleToggle` ignores (`if (value) return`). `toggleOpen("search")` is never dispatched.

**Fix:** Add `onClick={() => toggleOpen("search")}` to the `Button`.

### 6b — Fix shortcut label
The shortcut is `Alt+K` (confirmed from `keyboard-action-handler.tsx` — `altKeyHandlerMap` uses `e.altKey`). The button currently shows `⌘K`. Update to `Alt+K` (static label — no runtime platform detection).

**Files:**
- `frontend/src/modules/notes/ui/spotlight-search/spotlight-search.tsx`

### 6c — App menu drawer (Mac-menubar style)

**What:** A `Menu` / `LayoutGrid` icon button in the TitleBar that opens a `DropdownMenu` listing all app actions grouped by category. Each row: action label on the left, `<kbd>` shortcut on the right — identical to Mac app menu bars and the v0.dev examples.

**Groups and actions:**

| Group | Action | Shortcut |
|---|---|---|
| Notes | New note | Alt+N |
| Notes | Search notes | Alt+K |
| Notes | Rename note | — |
| Notes | Delete note | — |
| View | Command palette | Ctrl+Shift+P |
| View | Editor view | — |
| View | Graph view | — |

**Component structure:**
- New file: `frontend/src/modules/shared/ui/title-bar/app-menu.tsx`
- Uses `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator` — all already in the shared barrel, same as `DocumentHeaderMenu`.
- Row template: `<span className="flex items-center justify-between w-full"><span>{label}</span><kbd className="text-xs text-gray-500">{shortcut}</kbd></span>`
- Items requiring an active note are `disabled` when `activeNote` is null.
- Dispatches via the same `useActionDialogsActions` / `useNotesActions` hooks.
- Icon: `LayoutGrid` (lucide), `h-7 w-7` ghost style matching other TitleBar buttons.

**Files:**
- `frontend/src/modules/shared/ui/title-bar/app-menu.tsx` (new)
- `frontend/src/modules/shared/ui/title-bar/title-bar.tsx` (mount `<AppMenu />`)

---

## Implementation Order

| # | Item | Complexity |
|---|------|------------|
| 1 | Item 3 — wiki-link bug fix | XS |
| 2 | Item 6a — search button fix | XS |
| 3 | Item 6b — shortcut label fix | XS |
| 4 | Item 2 — node→editor via view switcher | XS |
| 5 | Item 5b — TitleBar focus ring | XS |
| 6 | Item 5a — TitleBar tooltips | S |
| 7 | Item 1 — graph node highlight on load | S |
| 8 | Item 6c — app menu drawer | S |
| 9 | Item 4 — editor view toggle | M |
