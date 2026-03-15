import { useActionDialogsActions } from "devnote/modules/shared/hooks/use-action-dialog-actions";
import {
  selectDialogType,
  selectIsActionDialogOpen,
} from "devnote/modules/shared/redux/selectors/action-dialog-selectors";
import { ChangeEvent, useState } from "react";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "devnote/config/api/axios-instance";
import { NoteResponse } from "../../core/get-notes-response";
import { CreateNoteInput } from "../../core/create-note-input";
import { NoteMapper } from "../../interface/mappers/notes.mapper";
import { NotesAdapter } from "../../interface/adapters/notes.adapter";
import { NoteEntity } from "../../core/entity/note.entity";
import { HttpError, isHttpError } from "devnote/modules/auth/core/http-error";

const validateFileName = (name: string): string => {
  if (!name.trim()) return "File name is required";

  if (!name) return "File name cannot be empty";

  // Check for leading/trailing dashes
  if (name.startsWith("-")) return "File name cannot start with a dash";
  if (name.endsWith("-")) return "File name cannot end with a dash";

  // Check for consecutive dashes
  if (name.includes("--")) return "File name cannot contain consecutive dashes";

  // Check for valid slug format: alphanumeric, dashes, underscores only
  const slugRegex = /^[a-zA-Z0-9-_]+$/;
  if (!slugRegex.test(name)) {
    return "File name can only contain letters, numbers, dashes, and underscores";
  }

  if (name.length > 50) return "File name is too long";

  return "";
};

export const useFileCreationDialog = () => {
  const { toggleClose } = useActionDialogsActions();

  const [fileName, setNewFileName] = useState("");
  const [fileNameError, setFileNameError] = useState("");

  const dialogType = useSelector(selectDialogType);
  const isActionDialogOpen = useSelector(selectIsActionDialogOpen);

  const isOpen = dialogType === "create-file" && isActionDialogOpen;

  const handleCreateFile = () => {
    const error = validateFileName(fileName);
    if (error) {
      setFileNameError(error);
      return;
    }

    // Here you would add the file creation logic
    mutate({
      title: fileName,
    });
    setNewFileName("");
    setFileNameError("");
  };

  const { mutate, isPending } = useMutation<
    NoteEntity,
    HttpError,
    CreateNoteInput
  >({
    mutationFn: async (input: CreateNoteInput) => {
      // Call your API adapter directly
      const response = await NotesAdapter.createNote(input);

      if (isHttpError(response)) {
        throw response;
      }

      return response;
    },
    onSuccess: (note) => {
      console.log("note:", note);
      setNewFileName("");
      setFileNameError("");
      handleToggle(false); 
    },
    onError: (error) => {
      setFileNameError(error?.data?.error || "Failed to create note");
    },
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(" ", "-").trim();
    if (value.endsWith("--")) return;

    setNewFileName(value);
    if (fileNameError) setFileNameError("");
  };

  const handleToggle = (value: boolean) => {
    if (value) return;

    toggleClose("create-file");
  };
  return {
    handleToggle,
    handleInputChange,
    handleCreateFile,
    isOpen,
    fileName,
    fileNameError,
    isLoading: isPending,
  };
};
