import { Middleware } from "@reduxjs/toolkit";
import {
  deltaSyncNotesFailure,
  deltaSyncNotesFinalized,
  deltaSyncNotesSuccess,
  getLocalNotesRequest,
  notesActions,
} from "../../slice/notes.slice";
import { NotesAdapter } from "../../../interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";
import LocalStorage from "devnote/core/local-storage";
import { initSQLite, syncNotesDelta } from "../../../../../../lib/sqlite";

export const deltaSyncNotesFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.deltaSyncNotesRequest.match(action)) {

    const userId = action.payload;
    const storageKey = `last_synced_${userId}`;
		const lastSync = LocalStorage.getItem<string>(storageKey);


    try {
      await initSQLite();

      const response = await NotesAdapter.getDeltaNotes(lastSync);

      if (isHttpError(response)) {
        throw new Error(`delta sync failed ${response}`);
      }

      await syncNotesDelta({...response, userId });
      LocalStorage.setItem(storageKey, new Date().toISOString());
      api.dispatch(deltaSyncNotesSuccess());
      
    } catch(err) {
      console.error(err);
      api.dispatch(deltaSyncNotesFailure("Unknown note delta sync error"));
    } finally {
      api.dispatch(deltaSyncNotesFinalized());

    }
  }
};

export const deltaSyncNotesSuccessMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (notesActions.deltaSyncNotesSuccess.match(action)) {

    api.dispatch(getLocalNotesRequest());

  }
};
