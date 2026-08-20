import { useActionDialogsActions } from "devnote/modules/shared/hooks/use-action-dialog-actions";
import {
  selectDialogType,
  selectIsActionDialogOpen,
} from "devnote/modules/shared/redux/selectors/action-dialog-selectors";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";
import { selectIsLoadingCreateNote } from "devnote/modules/notes/redux/selector/notes-selectors";
import { RootState } from "devnote/redux/store/store";

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
  const { handleCreateNote } = useNotesActions();

  const [fileName, setNewFileName] = useState("");
  const [fileNameError, setFileNameError] = useState("");

  const dialogType = useSelector(selectDialogType);
  const isActionDialogOpen = useSelector(selectIsActionDialogOpen);
  const isLoadingCreateNote = useSelector(selectIsLoadingCreateNote);
  const creatingNoteError = useSelector((state: RootState) => state.notes.creatingNoteError);

  const isOpen = dialogType === "create-file" && isActionDialogOpen;

  const prevLoadingRef = useRef(false);

  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = isLoadingCreateNote;

    if (wasLoading && !isLoadingCreateNote) {
      if (creatingNoteError) {
        setFileNameError(creatingNoteError);
      } else {
        setNewFileName("");
        setFileNameError("");
        toggleClose("create-file");
      }
    }
  }, [isLoadingCreateNote, creatingNoteError, toggleClose]);

  useEffect(() => {
    if (!isOpen) {
      setNewFileName("");
      setFileNameError("");
    }
  }, [isOpen]);

  const handleCreateFile = () => {
    const error = validateFileName(fileName);
    if (error) {
      setFileNameError(error);
      return;
    }
    handleCreateNote({ title: fileName });
  };

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
    isLoading: isLoadingCreateNote,
  };
};
