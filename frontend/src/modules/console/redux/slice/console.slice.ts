import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ConsoleOutputEntry } from "../../core/console-output-entry.type";

type ConsoleState = {
  outputHistory: ConsoleOutputEntry[]
  isConsoleOpen: boolean
  commandHistory: string[]
}

const initialState: ConsoleState = {
  outputHistory: [],
  isConsoleOpen: true,
  commandHistory: [],
};

const consoleSlice = createSlice({
  name: "console",
  initialState,
  reducers: {
    executeCommand(_state, _action: PayloadAction<string>) {},
    appendOutput(state, action: PayloadAction<ConsoleOutputEntry>) {
      state.outputHistory.push(action.payload);
    },
    clearOutput(state) {
      state.outputHistory = [];
    },
    toggleConsole(state) {
      state.isConsoleOpen = !state.isConsoleOpen;
    },
    pushCommandHistory(state, action: PayloadAction<string>) {
      state.commandHistory.unshift(action.payload);
      if (state.commandHistory.length > 50) {
        state.commandHistory.pop();
      }
    },
  },
});

export const {
  executeCommand,
  appendOutput,
  clearOutput,
  toggleConsole,
  pushCommandHistory,
} = consoleSlice.actions;

export const consoleActions = consoleSlice.actions;
export const consoleReducer = consoleSlice.reducer;
