import { RootState } from "../../../../redux/store/store";

export const selectIsLoadingDeltaSync = (state: RootState) => state.notes.isLoadingDeltaSync;

export const selectDeltaSyncError = (state: RootState) => state.notes.deltaSyncError;
