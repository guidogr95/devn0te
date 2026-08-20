import { Dialog, DialogContent, DevNoteInput } from "devnote/modules/shared";
import { useCommandPalette } from "./use-command-palette";

export const CommandPalette = () => {
  const {
    isOpen,
    filter,
    setFilter,
    selectedIndex,
    setSelectedIndex,
    filteredActions,
    handleClose,
    handleKeyDown,
  } = useCommandPalette();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="bg-gray-900 border border-gray-700 p-0 max-w-lg w-full">
        <div onKeyDown={handleKeyDown}>
          <div className="px-4 py-3 border-b border-gray-700">
            <DevNoteInput
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Type a command..."
              className="bg-transparent border-none text-gray-100 font-mono text-sm p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 w-full placeholder-gray-500"
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="py-1 max-h-72 overflow-y-auto">
            {filteredActions.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500 text-sm font-mono">No commands found</div>
            ) : (
              filteredActions.map((action, index) => (
                <button
                  key={action.id}
                  disabled={!action.enabled}
                  onClick={() => action.execute()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-4 py-2 font-mono text-sm flex flex-col gap-0.5 transition-colors ${
                    !action.enabled
                      ? "opacity-40 cursor-not-allowed text-gray-500"
                      : index === selectedIndex
                      ? "bg-gray-700 text-green-400"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <span>{action.label}</span>
                  <span className="text-xs text-gray-500">{action.description}</span>
                </button>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-gray-700 flex gap-4 text-xs text-gray-600 font-mono">
            <span>↑↓ navigate</span>
            <span>↵ execute</span>
            <span>esc close</span>
            <span className="ml-auto">ctrl+shift+p</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
