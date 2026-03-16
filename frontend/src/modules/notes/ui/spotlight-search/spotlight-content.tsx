"use client";
import { DevNoteInput, DialogContent, ScrollArea } from "devnote/modules/shared";
import { File } from "lucide-react";
import { ChangeEvent, ReactNode, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";
import {
  selectedSelectedIndex,
  selectLocalNotesList,
  selectLocalQueryResults,
  selectLocalQuerySearchTerm,
} from "../../redux/selector/query-local-notes-selectors";
import { useQueryLocalNotes } from "../../hooks/use-query-local-notes";
import { useNotesActions } from "../../hooks/use-notes-actions";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useRenderPreview } from "../../hooks/use-render-preview";
import { fuzzySearch } from "../../utils/fuzzy-search";
import { visit } from "unist-util-visit";
import type { Root, Text, Element } from "hast";

function highlightText(text: string, query: string): ReactNode {
  if (!query.trim()) return text;
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  const pattern = new RegExp(
    `(${tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  );
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-yellow-400/30 text-yellow-200 rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function makeHighlightPlugin(query: string) {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;
  const pattern = new RegExp(
    `(${tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  );
  return () => (tree: Root) => {
    visit(tree, "text", (node: Text, index: number | undefined, parent: Root | Element | undefined) => {
      if (!parent || index === undefined) return;
      const parts = node.value.split(pattern);
      if (parts.length === 1) return;
      const newNodes = parts
        .filter(p => p !== "")
        .map((part) =>
          pattern.test(part)
            ? ({ type: "element", tagName: "mark", properties: { className: ["search-highlight"] }, children: [{ type: "text", value: part }] } as Element)
            : ({ type: "text", value: part } as Text)
        );
      pattern.lastIndex = 0;
      (parent.children as (Text | Element)[]).splice(index, 1, ...newNodes);
    });
  };
}

export function SpotlightContent() {
  const localQueryResults = useSelector(selectLocalQueryResults);
  const localQuerySearchTerm = useSelector(selectLocalQuerySearchTerm);
  const selectedIndex = useSelector(selectedSelectedIndex);
  const localNotesList = useSelector(selectLocalNotesList);

  // const isLoadingDeltaSync = useSelector(selectIsLoadingDeltaSync);
  // const isLoadingLocalQuery = useSelector(selectIsLoadingLocalQuery);
  // const localQueryError = useSelector(selectLocalQueryError);

  const { handleSetLocalQuerySearchTerm } = useNotesActions();

  const { handleQueryLocalNotes, handleSelectResult } = useQueryLocalNotes();

  const fuzzyOnlyResults = useMemo(() => {
    if (!localQuerySearchTerm) return [];
    const ftsIds = new Set(localQueryResults.map(n => n.id));
    return fuzzySearch(localQuerySearchTerm, localNotesList).filter(n => !ftsIds.has(n.id));
  }, [localQuerySearchTerm, localQueryResults, localNotesList]);

  const resolvedLinks = useMemo(() => {
    const resolvedLinksMap: Record<number, string> = {};
    for (const note of localNotesList) {
      resolvedLinksMap[note.id] = note.title;
    }
    return resolvedLinksMap;
  }, [localNotesList]);

  const preprocessSearchTerm = useCallback((term: string): string => {
    if (!term.trim()) return "";
    const words = term.split(/\s+/).map((word) => {
      if (word.startsWith('"') && word.endsWith('"')) {
        const inner = word.slice(1, -1).trim();
        return `"${inner}*"`;
      }
      return `${word}*`;
    });
    return words.join(" ");
  }, []);

  const handleChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      const processedText = preprocessSearchTerm(ev.target.value.trim());
      handleSetLocalQuerySearchTerm(ev.target.value);
      handleQueryLocalNotes(processedText);
    },
    [handleQueryLocalNotes, handleSetLocalQuerySearchTerm, preprocessSearchTerm]
  );

  const { preview } = useRenderPreview({
    content: localQueryResults?.[selectedIndex]?.content || "",
    resolvedLinks,
  });

  const highlightPlugin = useMemo(() => makeHighlightPlugin(localQuerySearchTerm), [localQuerySearchTerm]);

  const totalCount = localQueryResults.length + fuzzyOnlyResults.length;
  const selectedNote = localQueryResults[selectedIndex];

  return (
    <DialogContent className="bg-gray-900 border border-gray-700 rounded-none p-0 max-w-5xl w-full overflow-hidden outline-none">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-700">
          <span className="text-green-400 font-mono text-sm select-none shrink-0">/</span>
          <DevNoteInput
            placeholder="search notes..."
            value={localQuerySearchTerm}
            onChange={handleChange}
            className="bg-transparent border-none text-gray-100 font-mono text-sm p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 w-full placeholder-gray-500"
            autoFocus
          />
        </div>

        <div className="flex h-[55vh] overflow-hidden">
          <div className="w-[38%] border-r border-gray-700 overflow-y-auto">
            {localQueryResults.length === 0 && fuzzyOnlyResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-600 font-mono text-xs">
                {localQuerySearchTerm ? "no results" : "type to search"}
              </div>
            ) : (
              <div className="py-1">
                {localQueryResults.map((result, index) => (
                  <div
                    key={result.id}
                    onClick={() => handleSelectResult(result.id)}
                    className={`flex items-center gap-2 px-3 py-1 cursor-pointer font-mono text-sm transition-colors ${
                      index === selectedIndex
                        ? "bg-gray-800 text-green-400"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-300"
                    }`}
                  >
                    <span className="w-3 shrink-0 text-green-500">{index === selectedIndex ? "›" : ""}</span>
                    <File className="h-3 w-3 shrink-0 opacity-50" />
                    <span className="truncate">{highlightText(result.title, localQuerySearchTerm)}<span className="opacity-50">.md</span></span>
                  </div>
                ))}
                {fuzzyOnlyResults.length > 0 && (
                  <>
                    <div className="mx-3 my-1 border-t border-gray-800" />
                    <div className="px-3 py-0.5 text-xs text-gray-600 font-mono">~ fuzzy</div>
                    {fuzzyOnlyResults.map(result => (
                      <div
                        key={result.id}
                        onClick={() => handleSelectResult(result.id)}
                        className="flex items-center gap-2 px-3 py-1 cursor-pointer font-mono text-sm text-gray-500 hover:bg-gray-800/50 hover:text-gray-400 transition-colors"
                      >
                        <span className="w-3 shrink-0" />
                        <File className="h-3 w-3 shrink-0 opacity-40" />
                        <span className="truncate">{highlightText(result.title, localQuerySearchTerm)}<span className="opacity-50">.md</span></span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 py-1 border-b border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-600 font-mono">PREVIEW</span>
              {selectedNote && (
                <span className="text-xs text-gray-500 font-mono truncate ml-2">{selectedNote.title}.md</span>
              )}
            </div>
            <ScrollArea className="h-full">
              <div className="p-4 prose prose-sm prose-invert max-w-none font-mono text-xs">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, ...(highlightPlugin ? [highlightPlugin] : [])]}>
                  {preview}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="px-4 py-1.5 border-t border-gray-700 flex items-center text-xs text-gray-600 font-mono">
          <span className="text-gray-500">
            {totalCount > 0 ? `${totalCount} results` : localQuerySearchTerm ? "no results" : ""}
          </span>
          <span className="ml-auto flex gap-4">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
            <span>esc close</span>
          </span>
        </div>
      </div>
    </DialogContent>
  );
}
