import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "devnote/redux/store/store";
import { selectDialogType, selectIsActionDialogOpen } from "devnote/modules/shared/redux/selectors/action-dialog-selectors";
import { useActionDialogsActions } from "devnote/modules/shared/hooks/use-action-dialog-actions";
import { selectActiveNote } from "devnote/modules/notes/redux/selector/notes-selectors";
import { deleteNoteByIdRequest } from "devnote/modules/notes/redux/slice/notes.slice";

type PaletteAction = {
  id: string
  label: string
  description: string
  enabled: boolean
  execute: () => void
}

export function useCommandPalette() {
  const dispatch = useDispatch<AppDispatch>();
  const dialogType = useSelector(selectDialogType);
  const isActionDialogOpen = useSelector(selectIsActionDialogOpen);
  const activeNote = useSelector(selectActiveNote);

  const { toggleOpen, toggleClose } = useActionDialogsActions();

  const isOpen = dialogType === "command-palette" && isActionDialogOpen;

  const [filter, setFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setFilter("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        if (isOpen) {
          toggleClose("command-palette");
        } else {
          toggleOpen("command-palette");
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, toggleOpen, toggleClose]);

  const actions: PaletteAction[] = useMemo(() => [
    {
      id: "new-note",
      label: "New Note",
      description: "Create a new note",
      enabled: true,
      execute: () => {
        toggleClose("command-palette");
        toggleOpen("create-file");
      },
    },
    {
      id: "search-notes",
      label: "Search Notes",
      description: "Open spotlight search",
      enabled: true,
      execute: () => {
        toggleClose("command-palette");
        toggleOpen("search");
      },
    },
    {
      id: "delete-note",
      label: "Delete Current Note",
      description: activeNote ? `Delete "${activeNote.title}"` : "No note open",
      enabled: !!activeNote,
      execute: () => {
        if (!activeNote) return;
        toggleClose("command-palette");
        dispatch(deleteNoteByIdRequest(activeNote.id));
      },
    },
  ], [activeNote, dispatch, toggleClose, toggleOpen]);

  const filteredActions = useMemo(() => {
    const term = filter.toLowerCase();
    return term
      ? actions.filter(a => a.label.toLowerCase().includes(term) || a.description.toLowerCase().includes(term))
      : actions;
  }, [filter, actions]);

  const handleClose = () => toggleClose("command-palette");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredActions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filteredActions[selectedIndex]?.execute();
    } else if (e.key === "Escape") {
      handleClose();
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  return {
    isOpen,
    filter,
    setFilter,
    selectedIndex,
    setSelectedIndex,
    filteredActions,
    handleClose,
    handleKeyDown,
  };
}
