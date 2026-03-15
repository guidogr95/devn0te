import { Middleware } from "@reduxjs/toolkit";
import {
  getLocalNotesFailure,
  getLocalNotesFinalized,
  getLocalNotesSuccess,
  notesActions,
  queryLocalNotesFailure,
  queryLocalNotesFinalized,
  queryLocalNotesSuccess,
} from "../../slice/notes.slice";
import { initSQLite, queryNotes } from "../../../../../../lib/sqlite";
import { RootState } from "devnote/redux/store/store";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const getLocalNotesListFlowMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  if (notesActions.getLocalNotesRequest.match(action)) {

    const { auth } = api.getState();
    const { user } = auth;

    
    try {
      if (!user) {
        throw new Error("no user present");
      }
      await initSQLite();

      const results = await queryNotes({
        searchTerm: "",
        userId: user.id
      });
      api.dispatch(getLocalNotesSuccess(results));
      
    } catch(err) {
      console.error(err);
      api.dispatch(getLocalNotesFailure("Unknown local note query error"));
    } finally {
      api.dispatch(getLocalNotesFinalized());

    }
  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const queryLocalNotesFlowMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  if (notesActions.queryLocalNotesRequest.match(action)) {

    const searchTerm = action.payload;
    const { auth } = api.getState();
    const { user } = auth;

    
    try {
      if (!user) {
        throw new Error("no user present");
      }
      await initSQLite();

      const results = await queryNotes({
        searchTerm,
        userId: user.id
      });
      console.log("result:",results);
      api.dispatch(queryLocalNotesSuccess(results));
      
    } catch(err) {
      console.error(err);
      api.dispatch(queryLocalNotesFailure("Unknown local note query error"));
    } finally {
      api.dispatch(queryLocalNotesFinalized());

    }
  }
};
