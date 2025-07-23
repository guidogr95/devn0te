import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";
import { selectNotesListSortOptions } from "devnote/modules/notes/redux/selector/notes-selectors";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "devnote/modules/shared";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, ArrowUpWideNarrow, Check } from "lucide-react";
import { PropsWithChildren } from "react";
import { useSelector } from "react-redux";

export const NotesListActions = () => {
	return (
    <ListSortActions/>
	);
};

type ActionButtonProps = PropsWithChildren<{
  onClick: () => void
  isActive?: boolean
}>;

const ActionButton = ({
  onClick,
  isActive,
  children
}: ActionButtonProps) => {
  return (
    <DropdownMenuItem
      className="focus:bg-bg-secondary cursor-pointer flex items-center justify-between focus:text-gray-100"
      onClick={onClick}>
      <span className="flex gap-3 items-center">
        {children}
      </span>
      <span className="flex items-center">
        {isActive && (
          <Check className="h-5 w-5" />
        )}
      </span>
    </DropdownMenuItem>
  );
};

const ListSortActions = () => {

  const {
    handleGetNotesList
  } = useNotesActions();

  const notesListSortOptions = useSelector(selectNotesListSortOptions);

  const isAsc = notesListSortOptions.direction === "asc";
  const isDesc = notesListSortOptions.direction === "desc";

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm bg-transparent text-gray-400 hover:bg-bg-primary hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-600"
          >
            <ArrowDownWideNarrow className="h-5 w-5" />
            <span className="sr-only">Open sort by meny</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          className="w-56 bg-bg-primary text-gray-300">

					<DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-bg-secondary" />

					<DropdownMenuLabel>Date created</DropdownMenuLabel>

          <ActionButton
            onClick={() => handleGetNotesList({ sortOptions: { value: "createdAt", direction: "asc" } })}
            isActive={isAsc && notesListSortOptions.value === "createdAt"}>
              <ArrowUpWideNarrow className="h-5 w-5"/> Asc

          </ActionButton>

          <ActionButton
            isActive={isDesc && notesListSortOptions.value === "createdAt"}
            onClick={() => handleGetNotesList({ sortOptions: { value: "createdAt", direction: "desc" } })}>
              <ArrowUpNarrowWide className="h-5 w-5"/> Desc
          </ActionButton>

          <DropdownMenuSeparator className="bg-bg-secondary" />
					
					<DropdownMenuLabel>Date updated</DropdownMenuLabel>

          <ActionButton
            isActive={isAsc && notesListSortOptions.value === "updatedAt"}
            onClick={() => handleGetNotesList({ sortOptions: { value: "updatedAt", direction: "asc" } })}>
            <ArrowUpWideNarrow className="h-5 w-5"/> Asc
          </ActionButton>

          <ActionButton
            isActive={isDesc && notesListSortOptions.value === "updatedAt"}
            onClick={() => handleGetNotesList({ sortOptions: { value: "updatedAt", direction: "desc" } })}>
            <ArrowUpNarrowWide className="h-5 w-5"/> Desc
          </ActionButton>

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
