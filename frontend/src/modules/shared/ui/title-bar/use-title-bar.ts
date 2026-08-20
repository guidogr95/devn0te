import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo, useState } from "react";
import { Routes } from "devnote/config/routing/routing";
import { selectActiveNote, selectIsChangesUnsavedMap, selectIsNoteUpdatingMap } from "devnote/modules/notes/redux/selector/notes-selectors";
import { selectUser } from "devnote/modules/auth/redux/selector/auth-selectors";
import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";
import { useToastActions } from "devnote/modules/shared/hooks/use-toast-actions";
import { useActionDialogsActions } from "devnote/modules/shared/hooks/use-action-dialog-actions";
import { createGenericDialog } from "devnote/modules/shared";
import { createShareNoteDialogContent } from "devnote/modules/notes/ui/note-editor-wrapper/document-header/document-header-options/create-share-note-dialog";
import { logoutRequest } from "devnote/modules/auth/redux/slice/auth.slice";
import { AppDispatch } from "devnote/redux/store/store";

export function useTitleBar() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { location } = useRouterState();

  const activeNote = useSelector(selectActiveNote);
  const isChangesUnsavedMap = useSelector(selectIsChangesUnsavedMap);
  const isNoteUpdatingMap = useSelector(selectIsNoteUpdatingMap);
  const user = useSelector(selectUser);

  const { handleDeleteNoteById } = useNotesActions();
  const { showToast, dismissToast } = useToastActions();
  const { toggleOpen } = useActionDialogsActions();


  const [isRenameOpen, setIsRenameOpen] = useState(false);

  const isEditorView = location.pathname.startsWith(Routes.dashboard.children.notes.path);
  const isGraphView = location.pathname.startsWith(Routes.dashboard.children.nodes.path);

  const isChangesUnsaved = useMemo(() => {
    return activeNote ? !!isChangesUnsavedMap?.[activeNote.id] : false;
  }, [activeNote, isChangesUnsavedMap]);

  const isNoteUpdating = useMemo(() => {
    return activeNote ? !!isNoteUpdatingMap?.[activeNote.id] : false;
  }, [activeNote, isNoteUpdatingMap]);

  const handleNavigateEditor = useCallback(() => {
    if (activeNote) {
      navigate({ to: "/dashboard/notes/$id", params: { id: String(activeNote.id) } });
      return;
    }
    navigate({ to: Routes.dashboard.children.notes.path });
  }, [navigate, activeNote]);

  const handleNavigateGraph = useCallback(() => {
    navigate({ to: "/dashboard/nodes/{-$id}" });
  }, [navigate]);

  const handleNewNote = useCallback(() => {
    toggleOpen("create-file");
  }, [toggleOpen]);

  const handleRenameNote = useCallback(() => {
    if (!activeNote) return;
    setIsRenameOpen(true);
  }, [activeNote]);

  const handleCloseRename = useCallback(() => {
    setIsRenameOpen(false);
  }, []);

  const handleShareNote = useCallback(() => {
    if (!activeNote) return;
    showToast({
      type: "custom",
      jsx: (_id) => createGenericDialog({
        title: "Share note?",
        contentSlot: createShareNoteDialogContent({
          note: activeNote,
          onCloseDialog: () => dismissToast(_id),
        }),
        hideOkButton: true,
        hideCancelButton: true,
        contentClassName: "max-w-96",
        onCancel: () => dismissToast(_id),
      }),
      data: { duration: Infinity },
    });
  }, [activeNote, showToast, dismissToast]);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDeleteNote = useCallback(() => {
    if (!activeNote) return;
    setIsDeleteOpen(true);
  }, [activeNote]);

  const handleCloseDelete = useCallback(() => setIsDeleteOpen(false), []);

  const handleConfirmDelete = useCallback(() => {
    if (!activeNote) return;
    handleDeleteNoteById(activeNote.id);
    setIsDeleteOpen(false);
  }, [activeNote, handleDeleteNoteById]);

  const handleSearch = useCallback(() => {
    toggleOpen("search");
  }, [toggleOpen]);

  const handleCommandPalette = useCallback(() => {
    toggleOpen("command-palette");
  }, [toggleOpen]);

  const handleSignOut = useCallback(() => {
    dispatch(logoutRequest());
  }, [dispatch]);

  const handleNavigateSettings = useCallback(() => {
    navigate({ to: Routes.dashboard.children.settings.path });
  }, [navigate]);

  return {
    activeNote,
    user,
    isEditorView,
    isGraphView,
    isChangesUnsaved,
    isNoteUpdating,
    isRenameOpen,
    isDeleteOpen,
    handleNavigateEditor,
    handleNavigateGraph,
    handleNewNote,
    handleRenameNote,
    handleCloseRename,
    handleShareNote,
    handleDeleteNote,
    handleCloseDelete,
    handleConfirmDelete,
    handleSearch,
    handleCommandPalette,
    handleSignOut,
    handleNavigateSettings,
  };
}
