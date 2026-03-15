"use client";
import { DevNoteInput, DialogContent, ScrollArea } from "devnote/modules/shared";
import { File, Search } from "lucide-react";
// import "github-markdown-css/github-markdown.css";
import { ChangeEvent, useCallback, useMemo } from "react";
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

	const resolvedLinks = useMemo(() => {
			const resolvedLinksMap: Record<number, string> = {};
	
			for (const note of localNotesList) {
				resolvedLinksMap[note.id] = note.title;
			}
	
			return resolvedLinksMap;
		}, [localNotesList]);

  const preprocessSearchTerm = useCallback((term: string): string => {
    if (!term.trim()) return "";

    // Split into words/phrases, append * to each word
    const words = term.split(/\s+/).map((word) => {
      // Preserve quoted phrases but add * to last word
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

	const {
		preview
	} = useRenderPreview({
		content: localQueryResults?.[selectedIndex]?.content || "",
		resolvedLinks
	});

  return (
    <DialogContent className="bg-transparent rounded-none outline-none p-0 max-w-6xl border-none w-full max-h-[80vh] h-full overflow-hidden">
      <div className="flex gap-4 h-full overflow-hidden">
        <div className="flex flex-col flex-1 gap-5">
          <div className="flex-1 border border-gray-700 bg-gray-900 rounded-md">
            {localQueryResults.length > 0 ? (
              <div className="p-2">
                {localQueryResults.map((result, index) => {
                  return (
										<div
											key={result.id}
											className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-700 transition-colors rounded-md ${
												index === selectedIndex
													? "bg-gray-700 text-green-300"
													: "text-gray-400"
											}`}
											onClick={() => handleSelectResult(result.id)}
										>
											<File className="h-4 w-4" />
											<div className="line-clamp-1 text-sm">{result.title}.md</div>
										</div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-lg font-medium mb-2">No results found</p>
                <p className="text-sm">{"Try searching for something else"}</p>
              </div>
            )}
          </div>
          <div>
            <DevNoteInput
              placeholder="Search for files, folders, and more..."
              value={localQuerySearchTerm}
              onChange={handleChange}
              className="bg-gray-900 text-white w-full placeholder-gray-400 text-md h-12 border-gray-700 border outline-none"
              autoFocus
            />
          </div>
        </div>
        <div className="w-[50%] border border-gray-700 bg-gray-900 rounded-md p-4 prose prose-md dark:prose-dark">
	        <ScrollArea className="h-full rounded-md border">
						<ReactMarkdown
							remarkPlugins={[remarkGfm]}	
							rehypePlugins={[rehypeRaw]}
						>
							{preview}
							{/* {renderWithResolvedLinks(preview)} */}
						</ReactMarkdown>
					</ScrollArea>

				</div>
      </div>

      {/* <div className="flex flex-col">
			<div className="p-6 border-b border-gray-700">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
					<Input
						placeholder="Search for files, folders, and more..."
						value={localQuerySearchTerm}
						onChange={handleChange}
						className="pl-12 bg-gray-800 border-gray-600 text-white placeholder-gray-400 text-lg h-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						autoFocus
					/>
				</div>
			</div>

			<div className="max-h-96 overflow-y-auto">
				{localQueryResults.length > 0 ? (
					<div className="p-2">
						{localQueryResults.map((result, index) => {
							return (
								<div
									key={result.id}
									className={`flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors ${
										index === selectedIndex ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"
									}`}
									onClick={() => handleSelectResult(result.id)}
								>
									<div className="flex-1 min-w-0">
										<div
											className={`font-medium text-sm mb-1 ${
												index === selectedIndex ? "text-white" : "text-white"
											}`}
										>
											{result.title}
										</div>
										<div className={`text-xs leading-relaxed line-clamp-1 ${
												index === selectedIndex ? "text-blue-100" : "text-gray-400"
											}`}
										dangerouslySetInnerHTML={{ __html: result.preview }} />
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="p-8 text-center text-gray-400">
						<Search className="w-12 h-12 mx-auto mb-4 text-gray-600" />
						<p className="text-lg font-medium mb-2">No results found</p>
						<p className="text-sm">{"Try searching for something else"}</p>
					</div>
				)}
			</div>

			{localQueryResults.length > 0 && (
				<div className="border-t border-gray-700 px-4 py-3 bg-gray-800/50">
					<div className="flex items-center justify-between text-xs text-gray-400">
						<div className="flex items-center gap-4">
							<span className="flex items-center gap-1">
								<kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-xs">↑↓</kbd>
								Navigate
							</span>
							<span className="flex items-center gap-1">
								<kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-xs">↵</kbd>
								Select
							</span>
							<span className="flex items-center gap-1">
								<kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-xs">esc</kbd>
								Close
							</span>
						</div>
						<span>{localQueryResults.length} results</span>
					</div>
				</div>
			)}
		</div> */}
    </DialogContent>
  );
}
