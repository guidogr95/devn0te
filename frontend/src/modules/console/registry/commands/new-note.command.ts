import { Command } from "../../core/command.type";
import { NotesAdapter } from "devnote/modules/notes/interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";
import { setActiveNote, getNotesListRequest, deltaSyncNotesRequest } from "devnote/modules/notes/redux/slice/notes.slice";

function validateTitle(title: string): string | null {
  if (!title) return "title is required";
  if (title.startsWith("-")) return "title cannot start with a dash";
  if (title.endsWith("-")) return "title cannot end with a dash";
  if (title.includes("--")) return "title cannot contain consecutive dashes";
  if (!/^[a-zA-Z0-9-_]+$/.test(title)) return "title can only contain letters, numbers, dashes, and underscores";
  if (title.length > 50) return "title is too long (max 50 chars)";
  return null;
}

export const newNoteCommand: Command = {
  name: "new-note",
  description: "Create a new note: new-note <title>",
  args: [{ type: "new-title" }],
  execute: async (args, { dispatch, getState }) => {
    const title = args[0];
    const validationError = validateTitle(title ?? "");
    if (validationError) return `Usage: new-note <title> — ${validationError}`;

    const result = await NotesAdapter.createNote({ title });

    if (isHttpError(result)) {
      const titleError = result.data?.errors?.title?.[0];
      return `Error: ${titleError ?? result.data?.error ?? "Failed to create note"}`;
    }

    dispatch(setActiveNote(result));
    dispatch(getNotesListRequest({ sortOptions: getState().notes.noteListSortOptions }));

    const { user } = getState().auth;
    if (user) dispatch(deltaSyncNotesRequest(user.id));

    return `Note "${result.title}" created.`;
  },
};
