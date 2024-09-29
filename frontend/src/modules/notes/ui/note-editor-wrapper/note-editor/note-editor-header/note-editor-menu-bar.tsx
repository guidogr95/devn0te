import { Button, DynamicIcon, Separator, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "devnote/modules/shared";
import { useNoteEditorMenuBar } from "./use-note-editor-menu-bar";
import { isDivider } from "devnote/modules/notes/utils/is-divider";

export const NoteEditorMenuBar = () => {

  const { items } = useNoteEditorMenuBar();

  return (
    <div className="editor__header">
      <TooltipProvider>
        <div className="flex flex-wrap items-center gap-1 p-1 border-t border-b border-bg-primary">
        {items.map((item, index) => (
          isDivider(item) ? (
            <Separator key={index} orientation="vertical" className="h-6 bg-bg-primary" />
          ) : (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={item.action}
                  className={`text-gray-300 hover:text-white hover:bg-bg-primary ${
                    item.isActive && item.isActive() ? "bg-bg-primary text-white" : ""
                  }`}
                >
                  {item.icon && <DynamicIcon iconName={item.icon} size={18}/>}
                  <span className="sr-only">{item.title}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          )
        ))}
        </div>
      </TooltipProvider>
    </div>
  );
};
