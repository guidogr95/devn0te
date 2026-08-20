"use client";
import { Button, Dialog, DialogTrigger } from "devnote/modules/shared";
import { Search } from "lucide-react";
import { SpotlightContent } from "./spotlight-content";
import { useSelector } from "react-redux";
import { selectDialogType, selectIsActionDialogOpen } from "devnote/modules/shared/redux/selectors/action-dialog-selectors";
import { useActionDialogsActions } from "devnote/modules/shared/hooks/use-action-dialog-actions";

export function SpotlightSearch() {
  const {
    toggleClose,
    toggleOpen
  } = useActionDialogsActions();


  const dialogType = useSelector(selectDialogType);
  const isActionDialogOpen = useSelector(selectIsActionDialogOpen);

  const isOpen = dialogType === "search" && isActionDialogOpen;

  const handleToggle = (value: boolean ) => {
    if (value) return;
    toggleClose("search");
  };

  return (
    <div className="">
      <Dialog open={isOpen} onOpenChange={handleToggle}>

        <DialogTrigger asChild>
          <Button
            fluid
            variant="ghost"
            className="bg-gray-900 flex justify-between w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            onClick={() => toggleOpen("search")}
          >
            <Search className="w-4 h-4 mr-2" />
            Search...
            <kbd className="ml-auto text-xs bg-gray-800 px-1.5 py-0.5">Alt+K</kbd>
          </Button>
        </DialogTrigger>

        <SpotlightContent/>
      </Dialog>
    </div>
  );
}
