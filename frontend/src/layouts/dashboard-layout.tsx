"use client";
import { PropsWithChildren } from "react";
import { useSelector } from "react-redux";
import { FileExplorer } from "devnote/modules/notes/ui/file-explorer";
import { ConsolePanel } from "devnote/modules/console/ui/console-panel";
import { TitleBar } from "devnote/modules/shared/ui/title-bar/title-bar";
import { CommandPalette } from "devnote/modules/shared/ui/command-palette/command-palette";
import { useBeforeUnloadGuard } from "devnote/modules/notes/hooks/use-before-unload-guard";
import { selectIsChangesUnsavedMap, selectIsNoteUpdatingMap } from "devnote/modules/notes/redux/selector/notes-selectors";

type Props = PropsWithChildren<{
	isSometing?: boolean
}>

export function DashboardLayout({ children }: Props) {
  const isNoteUpdatingMap = useSelector(selectIsNoteUpdatingMap);
  const isChangesUnsavedMap = useSelector(selectIsChangesUnsavedMap);
  const shouldGuard =
    Object.values(isNoteUpdatingMap ?? {}).some(Boolean) ||
    Object.values(isChangesUnsavedMap ?? {}).some(Boolean);
  useBeforeUnloadGuard(shouldGuard);
  return (
    <div className="h-screen bg-gray-900 text-green-400 font-mono flex flex-col">
      <TitleBar />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex relative">
          <div className="flex-1 bg-gray-900 py-4 overflow-hidden">
            {children}
          </div>
        </div>
        <FileExplorer />
      </div>
      <ConsolePanel />
      <CommandPalette />
    </div>
  );
}
