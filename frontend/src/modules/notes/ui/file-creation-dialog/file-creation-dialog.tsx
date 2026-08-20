import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "devnote/modules/shared";
import { useFileCreationDialog } from "./use-file-creation-dialog";



export const FileCreationDialog = () => {


	const {
		handleToggle,
		handleInputChange,
		handleCreateFile,
		isOpen,
		fileName,
		fileNameError,
		isLoading
	} = useFileCreationDialog();

	return (
		<Dialog open={isOpen} onOpenChange={handleToggle}>
			<DialogContent className="bg-gray-800 border-gray-600 text-green-400 font-mono max-w-md">
				<DialogHeader>
					<DialogTitle className="text-green-400 text-sm">:edit</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<div className="text-xs text-gray-400 mb-2">Enter file name:</div>
						<Input
							value={fileName}
							onChange={handleInputChange}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleCreateFile();
								if (e.key === "Escape") handleToggle(false);
							}}
							className="bg-gray-900 border-gray-600 text-green-400 font-mono text-sm focus:border-green-400"
							placeholder="my-new-note"
							autoFocus
						/>
						{fileNameError && <div className="text-red-400 text-xs mt-1">{fileNameError}</div>}
					</div>
					<div className="flex justify-end gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleToggle(false)}
							className="text-gray-400 hover:text-gray-300 hover:bg-gray-700 text-xs"
						>
							Cancel
						</Button>
						<Button
							size="sm"
							loading={isLoading}
							onClick={handleCreateFile}
							className="bg-green-700 hover:bg-green-600 text-gray-900 text-xs"
						>
							Create
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};


