import { ChangeEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { NotePreviewEntity } from "devnote/modules/notes/core/entity/note-preview.entity";
import { NoteEntity } from "devnote/modules/notes/core/entity/note.entity";
import { NotesAdapter } from "devnote/modules/notes/interface/adapters/notes.adapter";
import { UpdateNoteInput } from "devnote/modules/notes/core/update-note-input";
import { HttpError, isHttpError } from "devnote/modules/auth/core/http-error";
import { updateNoteInList, setActiveNote } from "devnote/modules/notes/redux/slice/notes.slice";
import { selectActiveNote } from "devnote/modules/notes/redux/selector/notes-selectors";
import { AppDispatch } from "devnote/redux/store/store";

const validateNoteTitle = (name: string): string => {
  if (!name.trim()) return "File name is required";
  if (name.startsWith("-")) return "File name cannot start with a dash";
  if (name.endsWith("-")) return "File name cannot end with a dash";
  if (name.includes("--")) return "File name cannot contain consecutive dashes";
  const slugRegex = /^[a-zA-Z0-9-_]+$/;
  if (!slugRegex.test(name)) {
    return "File name can only contain letters, numbers, dashes, and underscores";
  }
  if (name.length > 50) return "File name is too long";
  return "";
};

export function useRenameNoteDialog(note: NotePreviewEntity, onClose: () => void) {
  const dispatch = useDispatch<AppDispatch>();
  const activeNote = useSelector(selectActiveNote);

  const [noteTitle, setNoteTitle] = useState(note.title);
  const [titleError, setTitleError] = useState("");

  const { mutate, isPending } = useMutation<NoteEntity, HttpError, UpdateNoteInput>({
    mutationFn: async (input: UpdateNoteInput) => {
      const response = await NotesAdapter.updateNoteById(input);
      if (isHttpError(response)) throw response;
      return response;
    },
    onSuccess: (updatedNote) => {
      dispatch(updateNoteInList(updatedNote));
      if (activeNote?.id === updatedNote.id) {
        dispatch(setActiveNote(updatedNote));
      }
      onClose();
    },
    onError: (error: HttpError) => {
      const titleError = error?.data?.errors?.title?.[0];
      setTitleError(titleError ?? error?.data?.error ?? "Failed to rename note");
    },
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(" ", "-").trim();
    if (value.endsWith("--")) return;
    setNoteTitle(value);
    if (titleError) setTitleError("");
  };

  const handleRename = () => {
    const error = validateNoteTitle(noteTitle);
    if (error) {
      setTitleError(error);
      return;
    }
    mutate({ id: note.id, title: noteTitle });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleRename();
    if (e.key === "Escape") onClose();
  };

  return {
    noteTitle,
    titleError,
    handleInputChange,
    handleRename,
    handleKeyDown,
    isPending,
  };
}
