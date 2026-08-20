import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "devnote/modules/shared";
import { RenameNoteDialog } from "devnote/modules/notes/ui/editor-file-list/rename-note-dialog";
import { DeleteNoteDialog } from "devnote/modules/notes/ui/editor-file-list/delete-note-dialog";
import { Menu, User, X } from "lucide-react";
import { useTitleBar } from "./use-title-bar";
import { AppMenu } from "./app-menu";

type Props = {
  onMenuToggle?: () => void
  isDrawerOpen?: boolean
}

export const TitleBar = ({ onMenuToggle, isDrawerOpen }: Props) => {
  const {
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
    handleDeleteNote,
    handleCloseDelete,
    handleConfirmDelete,
    handleSearch,
    handleCommandPalette,
    handleSignOut,
    handleNavigateSettings,
  } = useTitleBar();

  return (
    <div className="h-10 bg-gray-900 border-b border-gray-700 flex items-center px-3 gap-3 shrink-0">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-green-400 font-mono text-sm font-bold shrink-0">devn0te</span>
        {activeNote && (
          <>
            <span className="text-gray-600 font-mono text-sm shrink-0">/</span>
            <button
              onClick={handleRenameNote}
              className="text-gray-300 font-mono text-sm hover:text-green-400 truncate max-w-32 md:max-w-48"
            >
              {activeNote.title}
            </button>
          </>
        )}
      </div>

      <div className="hidden md:flex items-center border border-gray-600 rounded-sm overflow-hidden shrink-0">
        <button
          onClick={handleNavigateEditor}
          className={`px-3 py-1 font-mono text-xs ${isEditorView ? "bg-green-700 text-gray-900" : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"}`}
        >
          editor
        </button>
        <button
          onClick={handleNavigateGraph}
          className={`px-3 py-1 font-mono text-xs ${isGraphView ? "bg-green-700 text-gray-900" : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"}`}
        >
          graph
        </button>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <AppMenu
          activeNote={activeNote}
          onNewNote={handleNewNote}
          onSearch={handleSearch}
          onRenameNote={handleRenameNote}
          onDeleteNote={handleDeleteNote}
          onNavigateEditor={handleNavigateEditor}
          onNavigateGraph={handleNavigateGraph}
          onCommandPalette={handleCommandPalette}
          onNavigateSettings={handleNavigateSettings}
          userName={user?.name}
          onSignOut={handleSignOut}
        />
        <span
          className={`text-xs font-mono ${isNoteUpdating ? "text-yellow-400" : isChangesUnsaved ? "text-orange-400" : "text-gray-600"}`}
          title={isNoteUpdating ? "Saving..." : isChangesUnsaved ? "Unsaved changes" : "Saved"}
        >
          ●
        </span>
        <div className="hidden md:flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-gray-300 hover:bg-gray-800 focus-visible:ring-0"
              >
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="w-48 bg-bg-primary text-gray-300">
              {user && (
                <div className="px-2 py-1.5 text-xs text-gray-500 font-mono border-b border-gray-700">
                  {user.name}
                </div>
              )}
              <DropdownMenuItem
                onClick={handleNavigateSettings}
                className="focus:bg-bg-secondary focus:text-gray-100 font-mono text-sm"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="focus:bg-bg-secondary focus:text-gray-100 font-mono text-sm"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {onMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="h-7 w-7 text-gray-400 hover:text-gray-300 hover:bg-gray-800 focus-visible:ring-0 md:hidden"
          >
            {isDrawerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {isRenameOpen && activeNote && (
        <RenameNoteDialog
          note={{ ...activeNote, preview: "" }}
          isOpen={isRenameOpen}
          onClose={handleCloseRename}
        />
      )}
      {activeNote && (
        <DeleteNoteDialog
          note={activeNote}
          isOpen={isDeleteOpen}
          onClose={handleCloseDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};
