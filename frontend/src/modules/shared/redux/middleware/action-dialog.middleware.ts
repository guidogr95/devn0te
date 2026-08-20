import { Middleware } from "@reduxjs/toolkit";
import { actionDialogActions } from "../slice/action-dialog.slice";
import { queryLocalNotesCleanup, queryLocalNotesRequest } from "devnote/modules/notes/redux/slice/notes.slice";

export const toggleCloseMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (actionDialogActions.toggleClose.match(action)) {
		const dialogType = action.payload;

		if (dialogType === "search") {
			api.dispatch(queryLocalNotesCleanup());
		}

  }
};

export const toggleOpenMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (actionDialogActions.toggleOpen.match(action)) {
		const dialogType = action.payload;

		if (dialogType === "search") {
			
			api.dispatch(queryLocalNotesRequest(""));
		}

  }
};
