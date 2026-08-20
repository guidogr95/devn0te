"use-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "devnote/modules/shared/ui/resizable";
import Editor, { useMonaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import "github-markdown-css/github-markdown.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { NoteEntity } from "devnote/modules/notes/core/entity/note.entity";
import { useNoteEditor } from "../note-editor/use-note-editor";
import { useSelector } from "react-redux";
import { selectLocalNotesList } from "devnote/modules/notes/redux/selector/query-local-notes-selectors";
import { useRenderPreview } from "devnote/modules/notes/hooks/use-render-preview";
import { ScrollArea } from "devnote/modules/shared";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "./monaco-editor.css";
import { Columns2, Code2, Eye } from "lucide-react";
import { useIsMobile } from "devnote/modules/shared/hooks/use-is-mobile";

type ViewMode = "split" | "editor" | "preview";

function useEditorViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => (localStorage.getItem("editor-view-mode") as ViewMode) || "split"
  );
  const setMode = useCallback((mode: ViewMode) => {
    localStorage.setItem("editor-view-mode", mode);
    setViewMode(mode);
  }, []);
  return { viewMode, setMode };
}

type Props = {
  note: NoteEntity;
};

export function registerNoteLinkCompletionProvider(
  monacoInstance: typeof monaco,
  titleToConnectorIdRef: React.MutableRefObject<Record<string, string>>
) {
  return monacoInstance.languages.registerCompletionItemProvider("markdown", {
    triggerCharacters: ["["],
    async provideCompletionItems(model, position) {
      const lineNumber = position.lineNumber;
      const column = position.column;


      const lineContent = model.getLineContent(lineNumber);
      const textBefore = lineContent.slice(0, column - 1);
      const textAfter = lineContent.slice(column - 1);

      const leftMatch = textBefore.match(/\[\[([^\]]*)$/);
      const rightMatch = textAfter.match(/^([^[\]]*)\]\]/);

      
      if (!leftMatch || !rightMatch) return { suggestions: [] };
      
      const filter = leftMatch[1] || "";
      
      const titles = Object.keys(titleToConnectorIdRef.current);

      return {
        suggestions: titles.map(
          (title) => ({
            label: title,
            kind: monacoInstance.languages.CompletionItemKind.Reference,
            insertText: title,
            detail: title,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: position.column - filter.length,
              endColumn: position.column,
            },
          })
        ),
      };
    },
  });
}

export const MonacoNoteEditor = ({ note }: Props) => {
  const navigate = useNavigate();
  const monaco = useMonaco();
  const isMobile = useIsMobile();
  const { viewMode, setMode } = useEditorViewMode();

  // On mobile, split is not viable — fall back to preview
  const effectiveViewMode: ViewMode = isMobile && viewMode === "split" ? "preview" : viewMode;

  const { handleEditorChange } = useNoteEditor();
  const localNotesList = useSelector(selectLocalNotesList);

  const [content, setContent] = useState(note.content);
  useEffect(() => {
    setContent(note.content ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const titleToConnectorId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const n of localNotesList) {
      map[n.title] = n.connectorId;
    }
    return map;
  }, [localNotesList]);

  const titleToConnectorIdRef = useRef(titleToConnectorId);
  useEffect(() => {
    titleToConnectorIdRef.current = titleToConnectorId;
  }, [titleToConnectorId]);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("vim-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "", foreground: "cccccc", background: "000000" },
          { token: "comment", foreground: "5c6370" },
          { token: "keyword", foreground: "c678dd" },
          { token: "string", foreground: "98c379" },
          { token: "number", foreground: "d19a66" },
          { token: "type", foreground: "e5c07b" },
          { token: "delimiter", foreground: "abb2bf" },
          { token: "operator", foreground: "56b6c2" },
          { token: "variable", foreground: "e06c75" },
          { token: "function", foreground: "61afef" },
          { token: "constant", foreground: "d19a66" },
          { token: "tag", foreground: "e06c75" },
          { token: "attribute", foreground: "d19a66" },
        ],
        colors: {
          "editor.background": "#111827",
          "editor.foreground": "#cccccc",
          "editorCursor.foreground": "#ffffff",
          "editor.lineHighlightBackground": "#1a1a1a",
          "editor.selectionBackground": "#264f78",
          "editorLineNumber.foreground": "#4a4a4a",
          "editorLineNumber.activeForeground": "#888888",
          "editor.inactiveSelectionBackground": "#3a3d41",
          "editorIndentGuide.background": "#2a2a2a",
          "editorIndentGuide.activeBackground": "#3a3a3a",
          "editorWhitespace.foreground": "#404040",
          "editorBracketMatch.background": "#0064001a",
          "editorBracketMatch.border": "#888888",
        },
      });
      monaco.editor.setTheme("vim-dark");
    }
  }, [monaco]);

  useEffect(() => {
    if (monaco && note?.id) {
      const disposable = registerNoteLinkCompletionProvider(monaco, titleToConnectorIdRef);
      return () => disposable?.dispose();
    }
  // titleToConnectorIdRef is stable; its .current is kept up to date by the effect above
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monaco, note?.id]);

  const handleEditorUpdate = useCallback(
    (content?: string) => {
      setContent(content || "");
      handleEditorChange({ content, id: note.id });
    },
    [handleEditorChange, note.id]
  );

  const { preview } = useRenderPreview({ titleToConnectorId, content });

  const editorPanel = (
    <Editor
      height="100%"
      defaultLanguage="markdown"
      theme="vim-dark"
      value={content}
      onChange={handleEditorUpdate}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        wordWrap: "on",
        lineNumbers: "on",
      }}
    />
  );

  const previewPanel = (
    <ScrollArea className="h-full rounded-md border">
      <div className="p-4 h-full prose dark:prose-dark markdown-view markdown-body table-cell w-full">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          components={{
            a: ({ href, children, ...props }) => {
              if (href?.startsWith("devnote://note/")) {
                const connectorId = href.replace("devnote://note/", "");
                const target = localNotesList.find(n => n.connectorId === connectorId);
                if (!target) return <span className="wiki-link-broken">{children}</span>;
                return (
                  <button
                    className="wiki-link"
                    onClick={() => navigate({ to: "/dashboard/notes/$id", params: { id: String(target.id) } })}
                  >
                    {children}
                  </button>
                );
              }
              return <a href={href} {...props}>{children}</a>;
            },
          }}
        >
          {preview}
        </ReactMarkdown>
      </div>
    </ScrollArea>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-start px-3 py-1 border-b border-gray-700 shrink-0">
        <div className="flex gap-0.5">
          <button
            onClick={() => setMode("editor")}
            className={`px-1.5 py-1 rounded-sm ${
              effectiveViewMode === "editor" ? "text-green-400" : "text-gray-600 hover:text-gray-400"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
          </button>
          {!isMobile && (
            <button
              onClick={() => setMode("split")}
              className={`px-1.5 py-1 rounded-sm ${
                effectiveViewMode === "split" ? "text-green-400" : "text-gray-600 hover:text-gray-400"
              }`}
            >
              <Columns2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => setMode("preview")}
            className={`px-1.5 py-1 rounded-sm ${
              effectiveViewMode === "preview" ? "text-green-400" : "text-gray-600 hover:text-gray-400"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {effectiveViewMode === "split" && (
        <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
          <ResizablePanel defaultSize={50} minSize={10}>
            {editorPanel}
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50} minSize={10}>
            {previewPanel}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
      {effectiveViewMode === "editor" && (
        <div className="flex-1 min-h-0">{editorPanel}</div>
      )}
      {effectiveViewMode === "preview" && (
        <div className="flex-1 min-h-0 overflow-hidden">{previewPanel}</div>
      )}
    </div>
  );
};
