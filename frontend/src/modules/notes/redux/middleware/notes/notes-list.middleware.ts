import { Middleware } from "@reduxjs/toolkit";
import { notesActions } from "../../slice/notes.slice";
import { router } from "devnote/main";
import { Routes } from "devnote/config/routing/routing";

export const setActiveNoteMiddleware: Middleware = (_api) => next => async action => {
  next(action);

  if (notesActions.setActiveNote.match(action)) {
    const note = action.payload;

		router.navigate({ to: Routes.dashboard.children.notes.params.getWithParams({ id: note.id }),  });
  }
};
