import { AppDispatch } from "devnote/redux/store/store";
import { RootState } from "devnote/redux/store/store";

export type CommandContext = {
  dispatch: AppDispatch
  getState: () => RootState
}

export type CommandArgType = "note-ref" | "new-title" | "string"

export type CommandArg = {
  type: CommandArgType
}

export type Command = {
  name: string
  description: string
  args?: CommandArg[]
  execute: (args: string[], context: CommandContext) => string | Promise<string>
}
