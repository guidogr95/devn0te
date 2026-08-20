import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authReducer } from "devnote/modules/auth/redux/slice/auth.slice";
import { notesReducer } from "devnote/modules/notes/redux/slice/notes.slice";
import { sharedNoteReducer } from "devnote/modules/notes/redux/slice/shared-note.slice";
import { toastReducer } from "devnote/modules/shared/redux/slice/toast.slice";
import { loginFlowMiddleware, logoutFlowMiddleware, signupFlowMiddleware, verifyTokenFlowMiddleware, loginFailureMiddleware, signupFailureMiddleware } from "devnote/modules/auth/redux/middleware/auth.middleware";
import { dismissToastMiddleware, showToastMiddleware } from "devnote/modules/shared/redux/middleware/toast.middleware";
import { deleteNoteByIdFailureMiddleware, deleteNoteByIdFlowMiddleware, deleteNoteByIdSuccessMiddleware } from "devnote/modules/notes/redux/middleware/notes/delete-note-by-id.middleware";
import { createNoteFlowMiddleware, createNoteSuccessMiddleware, createNoteFailureMiddleware } from "devnote/modules/notes/redux/middleware/notes/create-note.middleware";
import { getNoteByIdFlowMiddleware } from "devnote/modules/notes/redux/middleware/notes/get-note-by-id.middleware";
import { getNotesFlowMiddleware, getNotesListNextPageFlowMiddleware } from "devnote/modules/notes/redux/middleware/notes/get-notes.middleware";
import { shareNoteFailureMiddleware, shareNoteFlowMiddleware, shareNoteSuccessMiddleware } from "devnote/modules/notes/redux/middleware/notes/share-note.middleware";
import { updateNoteByIdFlowMiddleware, updateNoteByIdSuccessMiddleware } from "devnote/modules/notes/redux/middleware/notes/update-note-by-id.middleware";
import { getNoteBySharingUrlFlowMiddleware } from "devnote/modules/notes/redux/middleware/shared-note/get-note-by-sharing-url.middleware";
import { setActiveNoteIdMiddleware, setActiveNoteMiddleware } from "devnote/modules/notes/redux/middleware/notes/notes-list.middleware";
import { deltaSyncNotesFlowMiddleware, deltaSyncNotesSuccessMiddleware } from "devnote/modules/notes/redux/middleware/notes/delta-sync-notes.middleware";
import { getLocalNotesListFlowMiddleware, queryLocalNotesFlowMiddleware } from "devnote/modules/notes/redux/middleware/notes/query-local-notes.middleware";
import { actionDialogReducer } from "devnote/modules/shared/redux/slice/action-dialog.slice";
import { toggleCloseMiddleware, toggleOpenMiddleware } from "devnote/modules/shared/redux/middleware/action-dialog.middleware";
import { consoleReducer } from "devnote/modules/console/redux/slice/console.slice";
import { executeCommandMiddleware } from "devnote/modules/console/redux/middleware/console.middleware";
import { configReducer } from "devnote/modules/config/redux/slice/config.slice";
import { fetchConfigMiddleware } from "devnote/modules/config/redux/middleware/config.middleware";
import { pushSyncMiddleware } from "devnote/modules/notes/redux/middleware/notes/push-sync.middleware";
import { connectorReducer } from "devnote/modules/connectors/redux/slice/connector.slice";
import { deleteConnectorMiddleware, fetchConnectorsMiddleware, saveConnectorMiddleware } from "devnote/modules/connectors/redux/middleware/connectors.middleware";
import { healthCheckMiddleware } from "devnote/modules/connectors/redux/middleware/health-check.middleware";
import { staleCheckMiddleware } from "devnote/modules/connectors/redux/middleware/stale-check.middleware";
import { removeStaleNotesMiddleware } from "devnote/modules/connectors/redux/middleware/remove-stale-notes.middleware";

const rootReducer = combineReducers({
  auth: authReducer,
  notes: notesReducer,
  sharedNote: sharedNoteReducer,
  toast: toastReducer,
  actionDialog: actionDialogReducer,
  console: consoleReducer,
  config: configReducer,
  connector: connectorReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "toast/showToast",
          "notes/getNoteByIdFailure"
        ],
        ignoredPaths: [
          "notes.activeNoteError",
        ],
      }
    })
    .prepend(
      loginFlowMiddleware,
      logoutFlowMiddleware,
      signupFlowMiddleware,
      verifyTokenFlowMiddleware,
      loginFailureMiddleware,
      signupFailureMiddleware,
      showToastMiddleware,
      dismissToastMiddleware,
      setActiveNoteMiddleware,
      setActiveNoteIdMiddleware,
      getNotesFlowMiddleware,
      getNoteByIdFlowMiddleware,
      updateNoteByIdFlowMiddleware,
      updateNoteByIdSuccessMiddleware,
      createNoteFlowMiddleware,
      createNoteSuccessMiddleware,
      createNoteFailureMiddleware,
      deleteNoteByIdFlowMiddleware,
      deleteNoteByIdSuccessMiddleware,
      deleteNoteByIdFailureMiddleware,
      shareNoteFlowMiddleware,
      shareNoteSuccessMiddleware,
      shareNoteFailureMiddleware,
      getNotesListNextPageFlowMiddleware,
      getNoteBySharingUrlFlowMiddleware,
      deltaSyncNotesFlowMiddleware,
      deltaSyncNotesSuccessMiddleware,
      queryLocalNotesFlowMiddleware,
      getLocalNotesListFlowMiddleware,
      toggleCloseMiddleware,
      toggleOpenMiddleware,
      executeCommandMiddleware,
      fetchConfigMiddleware,
      pushSyncMiddleware,
      fetchConnectorsMiddleware,
      saveConnectorMiddleware,
      deleteConnectorMiddleware,
      healthCheckMiddleware,
      staleCheckMiddleware,
      removeStaleNotesMiddleware,
    ),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
