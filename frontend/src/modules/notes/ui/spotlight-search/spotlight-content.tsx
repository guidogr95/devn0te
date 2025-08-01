"use client";
import { DialogContent, Input } from "devnote/modules/shared";
import { Search } from "lucide-react";
import { useState, ChangeEvent, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectIsLoadingDeltaSync } from "../../redux/selector/delta-sync-notes-selectors";
import { selectIsLoadingLocalQuery, selectLocalQueryError, selectLocalQueryResults } from "../../redux/selector/query-local-notes-selectors";
import { useQueryLocalNotes } from "../../hooks/use-query-local-notes";
import { useNotesActions } from "../../hooks/use-notes-actions";


type Props = {
	handleToggle: (value: boolean) => void
	isOpen: boolean
}

export function SpotlightContent({
	handleToggle,
	isOpen
}: Props) {
  const [query, setQuery] = useState("");
  
	const [selectedIndex, setSelectedIndex] = useState(0);
	const localQueryResults = useSelector(selectLocalQueryResults);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "k") {
        e.preventDefault();
        handleToggle(true);
      }

      if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, localQueryResults.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && localQueryResults.length > 0) {
          e.preventDefault();
          // Handle selection
					const selected = localQueryResults[selectedIndex];
          handleSelectResult(selected.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, localQueryResults, selectedIndex]);

	// const isLoadingDeltaSync = useSelector(selectIsLoadingDeltaSync);
	// const isLoadingLocalQuery = useSelector(selectIsLoadingLocalQuery);
	// const localQueryError = useSelector(selectLocalQueryError);

	const {
		handleSetActiveNoteId,
		handleLocalQueryCleanup
	} = useNotesActions();

	const {
		handleQueryLocalNotes
	} = useQueryLocalNotes();

	const preprocessSearchTerm = useCallback((term: string): string => {
  if (!term.trim()) return "";

  // Split into words/phrases, append * to each word
  const words = term.split(/\s+/).map(word => {
    // Preserve quoted phrases but add * to last word
    if (word.startsWith("\"") && word.endsWith("\"")) {
      const inner = word.slice(1, -1).trim();
      return `"${inner}*"`;
    }
    return `${word}*`;
  });

  return words.join(" ");
}, []);

	const handleChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
		const processedText = preprocessSearchTerm(ev.target.value.trim());
		setQuery(ev.target.value);
    setSelectedIndex(0);
		handleQueryLocalNotes(processedText);
	}, [handleQueryLocalNotes, preprocessSearchTerm]);

	const handleSelectResult = useCallback((noteId: number) => {
		handleSetActiveNoteId(noteId);
		handleToggle(false);
		setQuery("");
		handleLocalQueryCleanup();
	}, [handleSetActiveNoteId, handleToggle]);


  return (
        
	<DialogContent className="bg-gray-900 border-gray-700 p-0 max-w-2xl w-full max-h-[80vh] overflow-hidden">
		<div className="flex flex-col">
			<div className="p-6 border-b border-gray-700">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
					<Input
						placeholder="Search for files, folders, and more..."
						value={query}
						onChange={handleChange}
						className="pl-12 bg-gray-800 border-gray-600 text-white placeholder-gray-400 text-lg h-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						autoFocus
					/>
				</div>
			</div>

			{/* Results */}
			<div className="max-h-96 overflow-y-auto">
				{localQueryResults.length > 0 ? (
					<div className="p-2">
						{localQueryResults.map((result, index) => {
							// const Icon = result.icon;
							return (
								<div
									key={result.id}
									className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
										index === selectedIndex ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"
									}`}
									onClick={() => handleSelectResult(result.id)}
								>
									{/* <Icon
										className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
											index === selectedIndex ? "text-white" : "text-gray-400"
										}`}
									/> */}
									<div className="flex-1 min-w-0">
										<div
											className={`font-medium text-sm mb-1 ${
												index === selectedIndex ? "text-white" : "text-white"
											}`}
										>
											{result.title}
										</div>
										<div
											className={`text-xs leading-relaxed line-clamp-1 ${
												index === selectedIndex ? "text-blue-100" : "text-gray-400"
											}`}
											dangerouslySetInnerHTML={{ __html: result.preview }}
										>
										</div>
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

			{/* Footer */}
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
		</div>
	</DialogContent>
  );
}
