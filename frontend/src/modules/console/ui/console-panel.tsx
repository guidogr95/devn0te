import { Input, ScrollArea } from "devnote/modules/shared";
import { useConsolePanel } from "./use-console-panel";

export const ConsolePanel = () => {
  const {
    inputValue,
    setInputValue,
    suggestion,
    outputHistory,
    handleKeyDown,
    bottomRef,
  } = useConsolePanel();

  const ghostSuffix = suggestion && suggestion.toLowerCase().startsWith(inputValue.toLowerCase())
    ? suggestion.slice(inputValue.length)
    : null;

  return (
    <div className="bg-gray-900 border-t border-gray-700 font-mono text-sm">
      {outputHistory.length > 0 && (
        <ScrollArea className="h-40">
          <div className="px-4 py-2 space-y-0.5">
            {outputHistory.map(entry => (
              <div
                key={entry.id}
                className={
                  entry.type === "input"
                    ? "text-green-400"
                    : entry.type === "error"
                    ? "text-red-400"
                    : "text-gray-300 whitespace-pre"
                }
              >
                {entry.type === "input" ? `> ${entry.text}` : entry.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      )}
      <div className="px-4 py-2 flex items-center border-t border-gray-700">
        <span className="text-green-400 mr-1 select-none shrink-0">:</span>
        <div className="relative flex-1">
          {ghostSuffix && (
            <div
              className="absolute inset-0 flex items-center overflow-hidden pointer-events-none font-mono text-sm"
              aria-hidden
            >
              <span className="invisible whitespace-pre">{inputValue}</span>
              <span className="text-gray-600 whitespace-pre">{ghostSuffix}</span>
            </div>
          )}
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none text-green-400 font-mono text-sm p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 w-full relative"
            placeholder={ghostSuffix ? "" : "Enter command... (type help)"}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
