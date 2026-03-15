"use client";

import { LocalNoteEntity } from "devnote/modules/notes/core/entity/local-note-entity";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "devnote/modules/shared";
import {
  Calendar,
  FileText,
  Link2,
  Hash,
  X,
  Edit,
  Copy,
  Share,
  Trash2,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  SquareIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { useState } from "react";
import { cn } from "devnote/utils/shadcn";

interface NotePreviewProps {
  note: LocalNoteEntity;
  onClose: () => void;
}

export function NotePreview({ note, onClose }: NotePreviewProps) {
  const outgoingNotes: LocalNoteEntity[] = [];
  const incomingNotes: LocalNoteEntity[] = [];
  // const outgoingNotes = note.linkedNotes
  //   .map((id) => allNotes.find((n) => n.id === id))
  //   .filter(Boolean) as Note[];
  // const incomingNotes = allNotes.filter((n) => n.linkedNotes.includes(note.id));

  const handleEdit = () => {
    console.log("[v0] Edit note:", note.id);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(note.content);
    console.log("[v0] Copied note content");
  };

  const handleShare = () => {
    console.log("[v0] Share note:", note.id);
  };

  const handleDelete = () => {
    console.log("[v0] Delete note:", note.id);
  };

  const handleOpenInEditor = () => {
    console.log("[v0] Open in editor:", note.id);
  };

  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      /> */}

      <Card
        className={cn(
          "absolute  left-6  bottom-1/4 overflow-hidden bg-popover/95 border-border shadow-xl z-50",
          {
            "top-6": !isOpen,
            "top-0": isOpen,
            "left-6": !isOpen,
            "left-0": isOpen,
            "bottom-0": isOpen,
            "right-0": isOpen,
            "w-[28rem]": !isOpen
          }
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-bold text-popover-foreground flex items-center gap-2 flex-1">
              <FileText className="w-5 h-5 text-accent" />
              {note.title}
            </CardTitle>
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpen}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <SquareIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(note.updatedAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Hash className="w-4 h-4" />
              100px
            </div>
          </div>

          <div className="flex items-center gap-1 pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 px-2"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-8 px-2"
            >
              <Share className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenInEditor}
              className="h-8 px-2"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 px-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-hidden">
          <Tabs defaultValue="content" className="h-[calc(100vh-16rem)]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="links">Links</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent
              value="content"
              className="mt-4 overflow-y-auto max-h-[calc(100vh-20rem)]"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-popover-foreground mb-2">
                    Content Preview
                  </h4>
                  <ScrollArea className="h-full rounded-md border">
                    <div className="p-4 h-full prose dark:prose-dark markdown-view markdown-body table-cell w-full">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeHighlight]}
                      >
                        {note.content}
                      </ReactMarkdown>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="links"
              className="mt-4 overflow-y-auto max-h-[calc(100vh-20rem)]"
            >
              <div className="space-y-4">
                {outgoingNotes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-popover-foreground mb-2 flex items-center gap-1">
                      <ArrowRight className="w-4 h-4 text-blue-500" />
                      Outgoing Links ({outgoingNotes.length})
                    </h4>
                    <div className="space-y-2">
                      {outgoingNotes.map((linkedNote) => (
                        <div
                          key={linkedNote.id}
                          className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-popover-foreground truncate">
                              {linkedNote.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {linkedNote.content.substring(0, 60)}...
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {incomingNotes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-popover-foreground mb-2 flex items-center gap-1">
                      <ArrowLeft className="w-4 h-4 text-green-500" />
                      Incoming Links ({incomingNotes.length})
                    </h4>
                    <div className="space-y-2">
                      {incomingNotes.map((linkedNote) => (
                        <div
                          key={linkedNote.id}
                          className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-popover-foreground truncate">
                              {linkedNote.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {linkedNote.content.substring(0, 60)}...
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {outgoingNotes.length === 0 && incomingNotes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No connected notes</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="details"
              className="mt-4 overflow-y-auto max-h-[calc(100vh-20rem)]"
            >
              <div className="space-y-4">
                {/* Tags */}
                {/* {note.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-popover-foreground mb-2">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-accent/10 text-accent hover:bg-accent/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )} */}

                <div>
                  <h4 className="text-sm font-semibold text-popover-foreground mb-2">
                    Metadata
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modified:</span>
                      <span>
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{note.content.length} characters</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Word count:</span>
                      <span>{note.content.split(/\s+/).length} words</span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-muted-foreground">Position:</span>
                      <span className="font-mono text-xs">
                        ({note.position[0].toFixed(1)},{" "}
                        {note.position[1].toFixed(1)},{" "}
                        {note.position[2].toFixed(1)})
                      </span>
                    </div> */}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
