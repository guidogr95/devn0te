import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "devnote/modules/shared";
import { useActionDialogsActions } from "devnote/modules/shared/hooks/use-action-dialog-actions";
import { FilePlus } from "lucide-react";

export const ExplorerActions = () => {

	const {
		toggleOpen
	} = useActionDialogsActions();

	return (
		<div className="flex gap-2">
			<TooltipProvider>
				<Tooltip delayDuration={200}>
					<TooltipTrigger onClick={() => toggleOpen("create-file")}>
						<FilePlus size={20} />
					</TooltipTrigger>
					<TooltipContent>
						<p>New file</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
};
