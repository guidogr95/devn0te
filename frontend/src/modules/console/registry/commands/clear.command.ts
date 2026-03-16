import { Command } from "../../core/command.type";
import { clearOutput } from "../../redux/slice/console.slice";

export const clearCommand: Command = {
  name: "clear",
  description: "Clear the console output",
  args: [],
  execute: (_args, { dispatch }) => {
    dispatch(clearOutput());
    return "";
  },
};
