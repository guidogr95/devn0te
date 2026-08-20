"use client";
import { memo, ChangeEvent, ReactNode, useCallback, useMemo } from "react";
import { DevNoteInput, DialogContent, ScrollArea } from "devnote/modules/shared";
import { ChevronRight, File } from "lucide-react";
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
import { useIsMobile } from "devnote/modules/shared/hooks/use-is-mobile";

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

type SearchResultItemProps = {
  id: number
  title: string
  isSelected: boolean
  isFuzzy: boolean
  query: string
  isMobile: boolean
  onSelect: (id: number) => void
};

const SearchResultItem = memo(function SearchResultItem({
  id, title, isSelected, isFuzzy, query, isMobile, onSelect,
}: SearchResultItemProps) {
  if (isMobile) {
    return (
      <div
        onClick={() => onSelect(id)}
        className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-800/60 cursor-pointer transition-colors ${
          isFuzzy
            ? "text-gray-500 active:bg-gray-800"
            : isSelected
              ? "bg-gray-800 text-green-400"
              : "text-gray-300 active:bg-gray-800"
        }`}
      >
        <File className={`h-4 w-4 shrink-0 ${isFuzzy ? "opacity-40" : "opacity-50"}`} />
        <span className="flex-1 font-mono text-sm truncate">
          {highlightText(title, query)}
          <span className="opacity-40">.md</span>
        </span>
        <ChevronRight className={`h-4 w-4 shrink-0 ${isFuzzy ? "text-gray-700" : "text-gray-600"}`} />
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(id)}
      className={`flex items-center gap-2 px-3 py-1 cursor-pointer font-mono text-sm transition-colors ${
        isFuzzy
          ? "text-gray-500 hover:bg-gray-800/50 hover:text-gray-400"
          : isSelected
            ? "bg-gray-800 text-green-400"
            : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-300"
      }`}
    >
      <span className="w-3 shrink-0 text-green-500">{isSelected && !isFuzzy ? "›" : ""}</span>
      <File className={`h-3 w-3 shrink-0 ${isFuzzy ? "opacity-40" : "opacity-50"}`} />
      <span className="truncate">{highlightText(title, query)}<span className="opacity-50">.md</span></span>
    </div>
  );
});

export function SpotlightContent() {
  const localQueryResults = useSelector(selectLocalQueryResults);
  const localQuerySearchTerm = useSelector(selectLocalQuerySearchTerm);
  const selectedIndex = useSelector(selectedSelectedIndex);
  const localNotesList = useSelector(selectLocalNotesList);
  const isMobile = useIsMobile();

  const { handleSetLocalQuerySearchTerm } = useNotesActions();

  const { handleQueryLocalNotes, handleSelectResult } = useQueryLocalNotes();

  const fuzzyOnlyResults = useMemo(() => {
    if (!localQuerySearchTerm) return [];
    const ftsIds = new Set(localQueryResults.map(n => n.id));
    return fuzzySearch(localQuerySearchTerm, localNotesList).filter(n => !ftsIds.has(n.id));
  }, [localQuerySearchTerm, localQueryResults, localNotesList]);

  const titleToConnectorId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const note of localNotesList) {
      map[note.title] = note.connectorId;
    }
    return map;
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
    titleToConnectorId,
  });

  const highlightPlugin = useMemo(() => makeHighlightPlugin(localQuerySearchTerm), [localQuerySearchTerm]);

  const totalCount = localQueryResults.length + fuzzyOnlyResults.length;
  const selectedNote = localQueryResults[selectedIndex];

  const searchInput = (
    <DevNoteInput
      placeholder="search notes..."
      value={localQuerySearchTerm}
      onChange={handleChange}
      className="bg-transparent border-none text-gray-100 font-mono text-sm p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 w-full placeholder-gray-500"
      autoFocus
    />
  );

  if (isMobile) {
    return (
      <DialogContent className="fixed top-0 left-0 translate-x-0 translate-y-0 w-full h-dvh max-w-none rounded-none p-0 bg-gray-900 border-0 overflow-hidden outline-none">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-700 pr-14 shrink-0">
            <span className="text-green-400 font-mono text-base select-none shrink-0">/</span>
            {searchInput}
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            {localQueryResults.length === 0 && fuzzyOnlyResults.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-600 font-mono text-sm">
                {localQuerySearchTerm ? "no results" : "type to search"}
              </div>
            ) : (
              <>
                {localQueryResults.map((result, index) => (
                  <SearchResultItem
                    key={result.id}
                    id={result.id}
                    title={result.title}
                    isSelected={index === selectedIndex}
                    isFuzzy={false}
                    query={localQuerySearchTerm}
                    isMobile
                    onSelect={handleSelectResult}
                  />
                ))}
                {fuzzyOnlyResults.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs text-gray-600 font-mono bg-gray-900/50 border-b border-gray-800/60">
                      ~ fuzzy matches
                    </div>
                    {fuzzyOnlyResults.map(result => (
                      <SearchResultItem
                        key={result.id}
                        id={result.id}
                        title={result.title}
                        isSelected={false}
                        isFuzzy
                        query={localQuerySearchTerm}
                        isMobile
                        onSelect={handleSelectResult}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          <div className="px-4 py-2 border-t border-gray-700 shrink-0 flex items-center justify-between">
            <span className="text-xs text-gray-600 font-mono">
              {totalCount > 0 ? `${totalCount} results` : localQuerySearchTerm ? "no results" : ""}
            </span>
            <span className="text-xs text-gray-600 font-mono">tap to open</span>
          </div>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="bg-gray-900 border border-gray-700 rounded-none p-0 max-w-5xl w-full overflow-hidden outline-none">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-700">
          <span className="text-green-400 font-mono text-sm select-none shrink-0">/</span>
          {searchInput}
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
                  <SearchResultItem
                    key={result.id}
                    id={result.id}
                    title={result.title}
                    isSelected={index === selectedIndex}
                    isFuzzy={false}
                    query={localQuerySearchTerm}
                    isMobile={false}
                    onSelect={handleSelectResult}
                  />
                ))}
                {fuzzyOnlyResults.length > 0 && (
                  <>
                    <div className="mx-3 my-1 border-t border-gray-800" />
                    <div className="px-3 py-0.5 text-xs text-gray-600 font-mono">~ fuzzy</div>
                    {fuzzyOnlyResults.map(result => (
                      <SearchResultItem
                        key={result.id}
                        id={result.id}
                        title={result.title}
                        isSelected={false}
                        isFuzzy
                        query={localQuerySearchTerm}
                        isMobile={false}
                        onSelect={handleSelectResult}
                      />
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
