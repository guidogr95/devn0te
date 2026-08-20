import { Command } from "../../core/command.type";
import { deleteNoteByIdRequest } from "devnote/modules/notes/redux/slice/notes.slice";

export const deleteNoteCommand: Command = {
  name: "delete-note",
  description: "Delete a note by ID or title: delete-note <id|title>",
  args: [{ type: "note-ref" }],
  execute: (args, { dispatch, getState }) => {
    const arg = args[0];
    if (!arg) return "Usage: delete-note <id|title>";

    const id = parseInt(arg, 10);
    if (!isNaN(id)) {
      dispatch(deleteNoteByIdRequest(id));
      return `Deleting note ${id}...`;
    }

    const note = getState().notes.localNotesList.find(n => n.title === arg);
    if (!note) return `Error: no note found with title "${arg}"`;
    dispatch(deleteNoteByIdRequest(note.id));
    return `Deleting note "${note.title}" (id: ${note.id})...`;
  },
};
