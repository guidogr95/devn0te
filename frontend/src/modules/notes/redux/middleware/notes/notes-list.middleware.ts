import { Middleware } from "@reduxjs/toolkit";
import { notesActions } from "../../slice/notes.slice";
import { router } from "devnote/main";
import { Routes } from "devnote/config/routing/routing";

export const setActiveNoteMiddleware: Middleware = (_api) => next => async action => {
  next(action);

  if (notesActions.setActiveNote.match(action)) {
    //
  }
};

export const setActiveNoteIdMiddleware: Middleware = (_api) => next => async action => {
  next(action);

  if (notesActions.setActiveNoteId.match(action)) {
    const noteId = action.payload;

    let path = Routes.dashboard.children.notes.path as string;


    if (noteId) {
      path = Routes.dashboard.children.notes.params.getWithParams({ id: noteId });
    }

		router.navigate({ to: path });
  }
};
