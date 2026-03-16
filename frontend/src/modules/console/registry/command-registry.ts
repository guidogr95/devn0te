import { Command } from "../core/command.type";
import { helpCommand } from "./commands/help.command";
import { clearCommand } from "./commands/clear.command";
import { newNoteCommand } from "./commands/new-note.command";
import { deleteNoteCommand } from "./commands/delete-note.command";
import { lsCommand } from "./commands/ls.command";

export const commandRegistry: Command[] = [
  helpCommand,
  newNoteCommand,
  deleteNoteCommand,
  lsCommand,
  clearCommand,
];
