import { FolderOpen } from "lucide-react";
import { SpotlightSearch } from "../spotlight-search";
import { EditorFileList } from "../editor-file-list";
import { ExplorerActions } from "./explorer-actions";
import { KeyboardActionHandler } from "./keyboard-action-handler";
import { FileCreationDialog } from "../file-creation-dialog";

export const FileExplorer = () => {
	return (
		<div className="w-64 bg-gray-800 border-l border-gray-700">
			<div className="p-3 border-b border-gray-700">
				<div className="flex items-center justify-between gap-2 text-gray-400">
					<div className="flex gap-2">
						<FolderOpen className="w-4 h-4" />
						<span className="text-sm font-semibold">~/notes</span>
					</div>
					<ExplorerActions />
				</div>
			</div>
			<FileCreationDialog />
			<KeyboardActionHandler />
			<div className="border-b border-gray-700">
				<SpotlightSearch />
			</div>
				
			<EditorFileList />
	</div>
	);
};
