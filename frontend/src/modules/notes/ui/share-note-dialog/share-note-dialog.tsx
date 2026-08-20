import { Check, Copy } from "lucide-react";
import {
  Button,
  DevNoteInput,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "devnote/modules/shared";
import { ShareNoteDialogProps } from "./types";
import { NoteSharingTypeEnum } from "../../core/enums/note-sharing-type.enum";
import { useShareNoteDialog } from "./use-share-note-dialog";

export const ShareNoteDlgContent = ({ note }: ShareNoteDialogProps) => {

	const {
		handleSubmit,
		onShareNote,
		setValue,
		accessLevel,
		accessNotices,
		register,
		errors,
		shareLink,
		linkRef,
		copyLink,
		copied,
		isLoadingShareNote,
		onUnshare
	} = useShareNoteDialog({ note });
	
  return (
		<form onSubmit={handleSubmit(onShareNote)} className="flex flex-col justify-between">
			<div className="grid gap-4 py-4">
				<div className="flex flex-col items-start gap-4">
					<Label htmlFor="access-level" className="text-right ">
						Access Level
					</Label>
					<Select
						value={accessLevel}
						onValueChange={(value) => setValue("accessLevel", value as NoteSharingTypeEnum)}>
						<SelectTrigger>
							<SelectValue placeholder="Select access level" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={NoteSharingTypeEnum.PUBLIC}>Public</SelectItem>
							<SelectItem value={NoteSharingTypeEnum.PASSWORD_PROTECTED}>Password protected</SelectItem>
							<SelectItem value={NoteSharingTypeEnum.PRIVATE}>Private</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="text-sm text-gray-400">
					{accessNotices[accessLevel]}
				</div>
				{accessLevel === NoteSharingTypeEnum.PASSWORD_PROTECTED && (
					<div className="flex flex-col items-start gap-4">
						<Label htmlFor="password" className="text-right">
							Password
						</Label>
						<DevNoteInput
							id="password"
							type="password"
							{...register("password")}
							error={errors.password}
						/>
					</div>
				)}
				<div className="flex flex-col items-start gap-4">
					<Label htmlFor="share-link" className="text-right">
						Share Link
					</Label>
					<div className="relative w-full">
						<DevNoteInput
							id="share-link"
							type="text"
							value={shareLink}
							readOnly
							ref={linkRef}
						/>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-700 text-gray-300"
							onClick={copyLink}
						>
							{copied ? (
								<Check className="h-4 w-4 text-green-500" />
							) : (
								<Copy className="h-4 w-4" />
							)}
							<span className="sr-only">{copied ? "Copied" : "Copy link"}</span>
						</Button>
					</div>
				</div>
			</div>
			<Button
				type="submit"			
				loading={isLoadingShareNote}
				className="w-full">
				Share
			</Button>
			{note.sharingType !== NoteSharingTypeEnum.PRIVATE && (
				<Button
					type="button"
					variant="destructive"
					onClick={onUnshare}
					className="w-full mt-2">
					Stop sharing
				</Button>
			)}
		</form>
  );
};
