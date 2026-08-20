import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store/store";
import {
  createNoteRequest,
  deleteNoteByIdRequest,
  getLocalNotesRequest,
  getNoteByIdRequest,
  getNotesListNextPageRequest,
  getNotesListRequest,
  queryLocalNotesCleanup,
  queryLocalNotesRequest,
  registerIsChangesUnsaved,
  setActiveNote,
  setActiveNoteId,
  setLocalQuerySearchTerm,
  shareNoteRequest,
  unshareNoteRequest,
  updateNoteByIdRequest
} from "../redux/slice/notes.slice";
import { NoteEntity } from "../core/entity/note.entity";
import { UpdateNoteInput } from "../core/update-note-input";
import { CreateNoteInput } from "../core/create-note-input";
import { ShareNoteInput } from "../core/share-note-input";
import { GetNotesSortOptions } from "../core/get-notes-sort-options";

export const useNotesActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleGetNotesList = (value: { sortOptions: GetNotesSortOptions }) => {
    dispatch(getNotesListRequest(value));
  };

  const handleGetNotesListNextPage = () => {
    dispatch(getNotesListNextPageRequest());
  };

  const handleGetNoteById = (noteId: number) => {
    dispatch(getNoteByIdRequest(noteId));
  };

  const handleSetActiveNote = (note: NoteEntity) => {
    dispatch(setActiveNote(note));
  };

  const handleSetActiveNoteId = (noteId: number) => {
    dispatch(setActiveNoteId(noteId));
  };

  const handleUpdateNoteById = (input: UpdateNoteInput) => {
    dispatch(updateNoteByIdRequest(input));
  };

  const handleDeleteNoteById = (id: number) => {
    dispatch(deleteNoteByIdRequest(id));
  };

  const handleRegisterIsChangesUnsaved = (id: number, state: boolean) => {
    dispatch(registerIsChangesUnsaved({ id, state }));
  };

  const handleCreateNote = (input: CreateNoteInput) => {
    dispatch(createNoteRequest(input));
  };

  const handleShareNote = (noteId: number, input: ShareNoteInput) => {
    dispatch(shareNoteRequest({ noteId, input }));
  };

  const handleUnshareNote = (noteId: number) => {
    dispatch(unshareNoteRequest({ noteId }));
  };

  const handleTriggerLocalQuery = (searchTerm: string) => {
    dispatch(queryLocalNotesRequest(searchTerm));
  };

  const handleLocalQueryCleanup = () => {
    dispatch(queryLocalNotesCleanup());
  };

  const handleSetLocalQuerySearchTerm = (value: string) => {
    dispatch(setLocalQuerySearchTerm(value));
  };

  const handleGetLocalNotesList = () => {
    dispatch(getLocalNotesRequest());
  };

  return {
    handleGetNotesList,
    handleSetActiveNote,
    handleGetNoteById,
    handleUpdateNoteById,
    handleRegisterIsChangesUnsaved,
    handleCreateNote,
    handleDeleteNoteById,
    handleShareNote,
    handleUnshareNote,
    handleGetNotesListNextPage,
    handleTriggerLocalQuery,
    handleSetActiveNoteId,
    handleLocalQueryCleanup,
    handleSetLocalQuerySearchTerm,
    handleGetLocalNotesList
  };
};
