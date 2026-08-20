import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "devnote/modules/shared";
import { NoteEntity } from "devnote/modules/notes/core/entity/note.entity";
import { LayoutGrid } from "lucide-react";

type AppMenuProps = {
  activeNote: NoteEntity | null
  onNewNote: () => void
  onSearch: () => void
  onRenameNote: () => void
  onDeleteNote: () => void
  onNavigateEditor: () => void
  onNavigateGraph: () => void
  onCommandPalette: () => void
  onNavigateSettings: () => void
  userName?: string
  onSignOut?: () => void
}

export const AppMenu = ({
  activeNote,
  onNewNote,
  onSearch,
  onRenameNote,
  onDeleteNote,
  onNavigateEditor,
  onNavigateGraph,
  onCommandPalette,
  onNavigateSettings,
  userName,
  onSignOut,
}: AppMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-gray-300 hover:bg-gray-800 focus-visible:ring-0"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" className="w-56 bg-bg-primary text-gray-300">
        <DropdownMenuLabel className="text-xs text-gray-500 font-mono">Notes</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem onClick={onNewNote} className="focus:bg-bg-secondary focus:text-gray-100 font-mono text-sm">
          <span className="flex items-center justify-between w-full">
            <span>New note</span>
            <kbd className="text-xs text-gray-500">Alt+N</kbd>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSearch} className="focus:bg-bg-secondary focus:text-gray-100 font-mono text-sm">
          <span className="flex items-center justify-between w-full">
            <span>Search notes</span>
            <kbd className="text-xs text-gray-500">Alt+K</kbd>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onRenameNote}
          disabled={!activeNote}
          className="focus:bg-bg-secondary focus:text-gray-100 font-mono text-sm"
        >
          <span>Rename note</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDeleteNote}
          disabled={!activeNote}
          className="focus:bg-bg-secondary focus:text-gray-100 font-mono text-sm"
        >
          <span>Delete note</span>
        </DropdownMenuItem>
        <DropdownMenuLabel className="text-xs text-gray-500 font-mono mt-1">View</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem onClick={onNavigateEditor} className="focus:bg-bg-secondary focus:text-gray-100 font-mono text-sm">
          <span>Editor view</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onNavigateGraph} className="focus:bg-bg-secondary focus:text-gray-100 font-mono text-sm">
          <span>Graph view</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCommandPalette} className="focus:bg-bg-secondary focus:text-gray-100 font-mono text-sm">
          <span className="flex items-center justify-between w-full">
            <span>Command palette</span>
            <kbd className="text-xs text-gray-500">Ctrl+Shift+P</kbd>
          </span>
        </DropdownMenuItem>
        {onSignOut && (
          <>
            <DropdownMenuLabel className="text-xs text-gray-500 font-mono mt-1">Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            {userName && (
              <div className="px-2 py-1.5 text-xs text-gray-500 font-mono">{userName}</div>
            )}
            <DropdownMenuItem onClick={onNavigateSettings} className="focus:bg-bg-secondary focus:text-gray-100 font-mono text-sm">
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSignOut} className="focus:bg-bg-secondary focus:text-gray-100 font-mono text-sm">
              Sign out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
