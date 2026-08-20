import { KeyboardEvent, useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "devnote/redux/store/store";
import { executeCommand } from "../redux/slice/console.slice";
import { selectCommandHistory, selectConsoleOutput } from "../redux/selector/console-selectors";
import { commandRegistry } from "../registry/command-registry";
import { selectLocalNotesList } from "devnote/modules/notes/redux/selector/query-local-notes-selectors";

function computeSuggestion(
  input: string,
  notes: { id: number; title: string }[],
): string | null {
  if (!input) return null;

  const hasTrailingSpace = input.endsWith(" ");
  const tokens = input.trimEnd().split(/\s+/);
  if (!tokens[0]) return null;

  // Command name completion: one token, no trailing space
  if (tokens.length === 1 && !hasTrailingSpace) {
    const partial = tokens[0];
    const match = commandRegistry.find(
      c => c.name.startsWith(partial) && c.name !== partial,
    );
    return match ? match.name : null;
  }

  // Argument completion
  const cmdName = tokens[0];
  const cmd = commandRegistry.find(c => c.name === cmdName);
  if (!cmd?.args) return null;

  const argTokens = tokens.slice(1);
  const argIndex = hasTrailingSpace ? argTokens.length : argTokens.length - 1;
  const argDef = cmd.args[argIndex];
  if (!argDef || argDef.type !== "note-ref") return null;

  const partial = hasTrailingSpace ? "" : argTokens[argTokens.length - 1];
  const lowerPartial = partial.toLowerCase();

  // Try title match first, then ID prefix
  const match =
    notes.find(n => n.title.toLowerCase().startsWith(lowerPartial) && n.title !== partial) ??
    notes.find(n => n.id.toString().startsWith(partial) && n.id.toString() !== partial);

  if (!match) return null;

  const prefix = hasTrailingSpace ? input : tokens.slice(0, -1).join(" ") + " ";
  return prefix + match.title;
}

export function useConsolePanel() {
  const dispatch = useDispatch<AppDispatch>();
  const outputHistory = useSelector(selectConsoleOutput);
  const commandHistory = useSelector(selectCommandHistory);
  const localNotesList = useSelector(selectLocalNotesList);
  const [inputValue, setInputValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    const sentinel = bottomRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isAtBottomRef.current = entry.isIntersecting; },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView();
    }
  }, [outputHistory]);

  const suggestion = useMemo(
    () => computeSuggestion(inputValue, localNotesList),
    [inputValue, localNotesList],
  );

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    dispatch(executeCommand(trimmed));
    setInputValue("");
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      if (suggestion) {
        setInputValue(suggestion);
        setHistoryIndex(-1);
      }
      return;
    }
    if (e.key === "Enter") {
      handleSubmit();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIndex + 1, commandHistory.length - 1);
      setHistoryIndex(next);
      setInputValue(commandHistory[next] ?? "");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = historyIndex - 1;
      if (next < 0) {
        setHistoryIndex(-1);
        setInputValue("");
      } else {
        setHistoryIndex(next);
        setInputValue(commandHistory[next] ?? "");
      }
    }
  };

  return {
    inputValue,
    setInputValue,
    suggestion,
    outputHistory,
    handleKeyDown,
    bottomRef,
  };
}
