import { PropsWithChildren, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  NotebookText,
  PlusCircle,
  Settings,
  Users,
} from "lucide-react";
import { useToggle } from "devnote/modules/shared/hooks/use-toggle";
import { Button, ScrollArea } from "devnote/modules/shared";
import { useNavigate } from "@tanstack/react-router";
import { Routes } from "devnote/config/routing/routing";
import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";
import { useSelector } from "react-redux";
import { selectIsLoadingCreateNote } from "devnote/modules/notes/redux/selector/notes-selectors";
import { cn } from "devnote/utils/shadcn";

export const Sidebar = ({ children }: PropsWithChildren<object>) => {
  const { isOpen, handleToggle } = useToggle(true);
  const navigate = useNavigate();

  const isLoadingCreateNote = useSelector(selectIsLoadingCreateNote);

  const { handleCreateNote } = useNotesActions();

  const buttonIconClass = useMemo(() => {
    return cn("h-4 w-4", { "mr-2": isOpen });
  }, [isOpen]);

  return (
    <div className="flex h-screen">
      <div
        className={`relative flex flex-col bg-bg-primary text-white transition-all duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-4 z-50 h-8 w-8 rounded-full bg-bg-primary p-0"
          onClick={handleToggle}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        <div className="flex h-16 items-center justify-center">
          <h2 className={`text-xl font-bold ${isOpen ? "block" : "hidden"}`}>
            devn0te
          </h2>
        </div>
        <ScrollArea
          className="flex-1 h-full"
          isfullheight="true">
          <nav className="p-2 flex flex-col justify-between h-full">
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                aria-label="Home"
                onClick={() => navigate({ to: Routes.dashboard.path })}
              >
                <Home className={buttonIconClass} />
                <span className={isOpen ? "block" : "hidden"}>Home</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                aria-label="Notes"
                onClick={() =>
                  navigate({ to: Routes.dashboard.children.notes.path })
                }
              >
                <NotebookText className={buttonIconClass} />
                <span className={isOpen ? "block" : "hidden"}>Notes</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                aria-label="Users"
              >
                <Users className={buttonIconClass} />
                <span className={isOpen ? "block" : "hidden"}>Users</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                aria-label="Settings"
              >
                <Settings className={buttonIconClass} />
                <span className={isOpen ? "block" : "hidden"}>Settings</span>
              </Button>
            </div>
            <div className="pb-8">
              <Button
                variant="secondary"
                className="w-full justify-start"
                aria-label="Create new note"
                loading={isLoadingCreateNote}
                onClick={() => handleCreateNote({ title: "", content: "" })}
              >
                <PlusCircle className={buttonIconClass} />
                <span className={isOpen ? "block" : "hidden"}>
                  Create new note
                </span>
              </Button>
            </div>
          </nav>
        </ScrollArea>
      </div>
      <main className="flex flex-1">{children}</main>
    </div>
  );
};
