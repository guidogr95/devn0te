import { NoteEntity } from "devnote/modules/notes/core/entity/note.entity";
import { Avatar, AvatarFallback, AvatarImage, Button, Card, NoteViewer } from "devnote/modules/shared";
import { ClipboardCopy } from "lucide-react";

type Props = {
  note: NoteEntity
}

export default function SharedNoteViewer({
  note
}: Props) {
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // You might want to add a toast notification here
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {note.title || "Untitled note"}
            </h1>
            <div className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt="John Doe" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">John Doe</p>
                <p className="text-xs text-gray-400">
                  Last updated: April 23, 2023
                </p>
              </div>
            </div>
          </div>
          <Button onClick={copyLink} className="w-full sm:w-auto">
            <ClipboardCopy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
        </header>

        <Card className="p-6 bg-gray-800 border-gray-700 shadow-lg">
          <NoteViewer content={note.content} />
          {/* <div className="prose prose-invert max-w-none">
          </div> */}
        </Card>
      </div>
    </div>
  );
}
