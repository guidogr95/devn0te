import { RootState } from "devnote/redux/store/store";

export const selectConsoleOutput = (state: RootState) => state.console.outputHistory;
export const selectIsConsoleOpen = (state: RootState) => state.console.isConsoleOpen;
export const selectCommandHistory = (state: RootState) => state.console.commandHistory;
