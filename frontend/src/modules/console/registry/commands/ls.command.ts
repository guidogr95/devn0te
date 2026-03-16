import { Command } from "../../core/command.type";

export const lsCommand: Command = {
  name: "ls",
  description: "List all notes",
  args: [],
  execute: (_args, { getState }) => {
    const notes = getState().notes.localNotesList;
    if (!notes || notes.length === 0) return "No notes found.";
    return notes.map((n, i) => `  ${String(i + 1).padStart(3)}.  [${n.id}]  ${n.title}`).join("\n");
  },
};
