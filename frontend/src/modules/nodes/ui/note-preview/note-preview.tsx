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
  Minus,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { useState } from "react";
import { cn } from "devnote/utils/shadcn";
import { useNavigate } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import { selectLocalNotesList } from "devnote/modules/notes/redux/selector/query-local-notes-selectors";
import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";
import { useToastActions } from "devnote/modules/shared/hooks/use-toast-actions";
import { createGenericDialog } from "devnote/modules/shared";
import { createShareNoteDialogContent } from "devnote/modules/notes/ui/note-editor-wrapper/document-header/document-header-options/create-share-note-dialog";
import { DeleteNoteDialog } from "devnote/modules/notes/ui/editor-file-list/delete-note-dialog";
import { Routes } from "devnote/config/routing/routing";
import { GraphEdge } from "reagraph";

type WindowState = "normal" | "minimized" | "maximized";

type NotePreviewProps = {
  note: LocalNoteEntity
  edges: GraphEdge[]
  onClose: () => void
  onDelete: () => void
};

export function NotePreview({ note, edges, onClose, onDelete }: NotePreviewProps) {
  const navigate = useNavigate();
  const localNotesList = useSelector(selectLocalNotesList);
  const { handleDeleteNoteById } = useNotesActions();
  const { showToast, dismissToast } = useToastActions();

  const noteId = String(note.id);
  const outgoingIds = edges.filter(e => e.source === noteId).map(e => e.target);
  const incomingIds = edges.filter(e => e.target === noteId).map(e => e.source);
  const outgoingNotes = localNotesList.filter(n => outgoingIds.includes(String(n.id)));
  const incomingNotes = localNotesList.filter(n => incomingIds.includes(String(n.id)));

  const [windowState, setWindowState] = useState<WindowState>("normal");
  const [copied, setCopied] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEdit = () => {
    navigate({ to: Routes.dashboard.children.notes.params.getWithParams({ id: note.id }) });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = () => {
    showToast({
      type: "custom",
      jsx: (_id) => createGenericDialog({
        title: "Share note?",
        contentSlot: createShareNoteDialogContent({
          note,
          onCloseDialog: () => dismissToast(_id),
        }),
        hideOkButton: true,
        hideCancelButton: true,
        contentClassName: "max-w-96",
        onCancel: () => dismissToast(_id),
      }),
      data: { duration: Infinity },
    });
  };

  const handleDeleteConfirm = () => {
    setIsDeleteOpen(false);
    onDelete();
  };

  const handleOpenInEditor = () => {
    navigate({ to: Routes.dashboard.children.notes.params.getWithParams({ id: note.id }) });
  };

  const isMaximized = windowState === "maximized";
  const isMinimized = windowState === "minimized";

  return (
    <>
      <Card
        className={cn(
          "absolute overflow-hidden bg-popover/95 border-border shadow-xl z-50",
          {
            "top-0 left-0 w-80": isMinimized,
            "top-0 left-0 bottom-0 right-0": isMaximized,
            "top-6 left-6 bottom-1/4 w-[28rem]": !isMinimized && !isMaximized,
          }
        )}
      >
        <CardHeader className={cn("pb-3", { "py-2": isMinimized })}>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className={cn("font-bold text-popover-foreground flex items-center gap-2 min-w-0", isMinimized ? "text-sm" : "text-lg")}>
              <FileText className="w-4 h-4 text-accent shrink-0" />
              <span className="truncate">{note.title}</span>
            </CardTitle>
            <div className="flex shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWindowState(s => s === "minimized" ? "normal" : "minimized")}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWindowState(s => s === "maximized" ? "normal" : "maximized")}
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

          {!isMinimized && (
            <>
              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Hash className="w-4 h-4" />
                  {note.content.split(/\s+/).filter(Boolean).length} words
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
                  {copied ? <span className="text-xs text-green-500">copied!</span> : <Copy className="w-4 h-4" />}
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
                  onClick={() => setIsDeleteOpen(true)}
                  className="h-8 px-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </CardHeader>

        {!isMinimized && (
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
                          onClick={() => navigate({ to: Routes.dashboard.children.nodes.params.getWithParams({ id: linkedNote.id }) })}
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
                          onClick={() => navigate({ to: Routes.dashboard.children.nodes.params.getWithParams({ id: linkedNote.id }) })}
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
                      <span>{note.content.split(/\s+/).filter(Boolean).length} words</span>
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
        )}
      </Card>

      <DeleteNoteDialog
        note={note}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
