import { RootState } from "devnote/redux/store/store";

export const selectIsLoadingNote = (state: RootState) => state.sharedNote.isLoadingNote;

export const selectNote = (state: RootState) => state.sharedNote.note;

export const selectNoteError = (state: RootState) => state.sharedNote.noteError;
