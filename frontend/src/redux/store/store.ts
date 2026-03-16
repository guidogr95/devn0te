import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authReducer } from "devnote/modules/auth/redux/slice/auth.slice";
import { notesReducer } from "devnote/modules/notes/redux/slice/notes.slice";
import { sharedNoteReducer } from "devnote/modules/notes/redux/slice/shared-note.slice";
import { toastReducer } from "devnote/modules/shared/redux/slice/toast.slice";
// Auth middleware
import { loginFlowMiddleware, logoutFlowMiddleware, signupFlowMiddleware, verifyTokenFlowMiddleware } from "devnote/modules/auth/redux/middleware/auth.middleware";
// Toast middleware
import { dismissToastMiddleware, showToastMiddleware } from "devnote/modules/shared/redux/middleware/toast.middleware";
// Note middleware
import { deleteNoteByIdFailureMiddleware, deleteNoteByIdFlowMiddleware, deleteNoteByIdSuccessMiddleware } from "devnote/modules/notes/redux/middleware/notes/delete-note-by-id.middleware";
import { createNoteFlowMiddleware, createNoteSuccessMiddleware } from "devnote/modules/notes/redux/middleware/notes/create-note.middleware";
import { getNoteByIdFlowMiddleware } from "devnote/modules/notes/redux/middleware/notes/get-note-by-id.middleware";
import { getNotesFlowMiddleware, getNotesListNextPageFlowMiddleware } from "devnote/modules/notes/redux/middleware/notes/get-notes.middleware";
import { shareNoteFailureMiddleware, shareNoteFlowMiddleware, shareNoteSuccessMiddleware } from "devnote/modules/notes/redux/middleware/notes/share-note.middleware";
import { cancelUpdateNoteByIdMiddleware, updateNoteByIdFlowMiddleware, updateNoteByIdSuccessMiddleware } from "devnote/modules/notes/redux/middleware/notes/update-note-by-id.middleware";
// Shared note middleware
import { getNoteBySharingUrlFlowMiddleware } from "devnote/modules/notes/redux/middleware/shared-note/get-note-by-sharing-url.middleware";
import { setActiveNoteIdMiddleware, setActiveNoteMiddleware } from "devnote/modules/notes/redux/middleware/notes/notes-list.middleware";
import { deltaSyncNotesFlowMiddleware, deltaSyncNotesSuccessMiddleware } from "devnote/modules/notes/redux/middleware/notes/delta-sync-notes.middleware";
import { getLocalNotesListFlowMiddleware, queryLocalNotesFlowMiddleware } from "devnote/modules/notes/redux/middleware/notes/query-local-notes.middleware";
import { actionDialogReducer } from "devnote/modules/shared/redux/slice/action-dialog.slice";
import { toggleCloseMiddleware, toggleOpenMiddleware } from "devnote/modules/shared/redux/middleware/action-dialog.middleware";
import { consoleReducer } from "devnote/modules/console/redux/slice/console.slice";
import { executeCommandMiddleware } from "devnote/modules/console/redux/middleware/console.middleware";

const rootReducer = combineReducers({
  auth: authReducer,
  notes: notesReducer,
  sharedNote: sharedNoteReducer,
  toast: toastReducer,
  actionDialog: actionDialogReducer,
  console: consoleReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "notes/setUpdateNoteAbortController",
          "toast/showToast",
          // get note by id
          "notes/getNoteByIdFailure"
        ],
        ignoredPaths: [
          "notes.updateNoteAbortControllerMap",
          // get note by id
          "notes.activeNoteError",
        ],
      }
    })
    .prepend(
      // Auth middleware
      loginFlowMiddleware,
      logoutFlowMiddleware,
      signupFlowMiddleware,
      verifyTokenFlowMiddleware,
      // Toast middleware
      showToastMiddleware,
      dismissToastMiddleware,
      // Note middleware
      setActiveNoteMiddleware,
      setActiveNoteIdMiddleware,
      getNotesFlowMiddleware,
      getNoteByIdFlowMiddleware,
      updateNoteByIdFlowMiddleware,
      updateNoteByIdSuccessMiddleware,
      cancelUpdateNoteByIdMiddleware,
      createNoteFlowMiddleware,
      createNoteSuccessMiddleware,
      deleteNoteByIdFlowMiddleware,
      deleteNoteByIdSuccessMiddleware,
      deleteNoteByIdFailureMiddleware,
      shareNoteFlowMiddleware,
      shareNoteSuccessMiddleware,
      shareNoteFailureMiddleware,
      getNotesListNextPageFlowMiddleware,
      // Shared note middleware
      getNoteBySharingUrlFlowMiddleware,
      // Delta Sync notes middleware,
      deltaSyncNotesFlowMiddleware,
      deltaSyncNotesSuccessMiddleware,
      // local notes query
      queryLocalNotesFlowMiddleware,
      getLocalNotesListFlowMiddleware,
      // action dialog,
      toggleCloseMiddleware,
      toggleOpenMiddleware,
      // console
      executeCommandMiddleware
    ),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
