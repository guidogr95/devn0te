import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "devnote/redux/store/store";
import { commandRegistry } from "../../registry/command-registry";
import { appendOutput, consoleActions, pushCommandHistory } from "../slice/console.slice";

export const executeCommandMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  if (consoleActions.executeCommand.match(action)) {
    const raw = action.payload.trim();
    if (!raw) return;

    api.dispatch(pushCommandHistory(raw));
    api.dispatch(appendOutput({ id: crypto.randomUUID(), type: "input", text: raw }));

    const [name, ...args] = raw.split(/\s+/);
    const command = commandRegistry.find(c => c.name === name);

    if (!command) {
      api.dispatch(appendOutput({
        id: crypto.randomUUID(),
        type: "error",
        text: `Unknown command: "${name}". Type "help" for available commands.`,
      }));
      return;
    }

    try {
      const result = await command.execute(args, {
        dispatch: api.dispatch,
        getState: api.getState,
      });
      if (result) {
        api.dispatch(appendOutput({ id: crypto.randomUUID(), type: "output", text: result }));
      }
    } catch {
      api.dispatch(appendOutput({
        id: crypto.randomUUID(),
        type: "error",
        text: `Error executing "${name}".`,
      }));
    }
  }
};
