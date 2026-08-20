import { Command } from "../../core/command.type";
import { commandRegistry } from "../command-registry";

export const helpCommand: Command = {
  name: "help",
  description: "Show available commands",
  args: [],
  execute: () => {
    const lines = commandRegistry.map(cmd => `  ${cmd.name.padEnd(20)} ${cmd.description}`);
    return ["Available commands:", ...lines].join("\n");
  },
};
