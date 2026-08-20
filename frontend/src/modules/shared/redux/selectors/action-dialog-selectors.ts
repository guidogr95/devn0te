import { RootState } from "devnote/redux/store/store";

export const selectDialogType = (state: RootState) => state.actionDialog.dialogType;

export const selectIsActionDialogOpen = (state: RootState) => state.actionDialog.isOpen;
