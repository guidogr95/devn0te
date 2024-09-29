import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store/store";
import {
  cancelUpdateNoteAbortController,
  createNoteRequest,
  deleteNoteByIdRequest,
  getNoteByIdRequest,
  getNotesListRequest,
  registerIsChangesUnsaved,
  setActiveNote,
  shareNoteRequest,
  updateNoteByIdRequest
} from "../redux/slice/notes.slice";
import { NoteEntity } from "../core/entity/note.entity";
import { UpdateNoteInput } from "../core/update-note-input";
import { CreateNoteInput } from "../core/create-note-input";
import { ShareNoteInput } from "../core/share-note-input";

export const useNotesActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleGetNotesList = () => {
    dispatch(getNotesListRequest());
  };

  const handleGetNoteById = (noteId: number) => {
    dispatch(getNoteByIdRequest(noteId));
  };

  const handleSetActiveNote = (note: NoteEntity) => {
    dispatch(setActiveNote(note));
  };

  const handleUpdateNoteById = (input: UpdateNoteInput) => {
    dispatch(updateNoteByIdRequest(input));
  };


  const handleDeleteNoteById = (id: number) => {
    dispatch(deleteNoteByIdRequest(id));
  };

  const handleCancelUpdateRequest = (id: number) => {
    dispatch(cancelUpdateNoteAbortController({ id }));
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

  return {
    handleGetNotesList,
    handleSetActiveNote,
    handleGetNoteById,
    handleUpdateNoteById,
    handleCancelUpdateRequest,
    handleRegisterIsChangesUnsaved,
    handleCreateNote,
    handleDeleteNoteById,
    handleShareNote
  };
};
