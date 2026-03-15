"use-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type Props = {
  note: NoteEntity;
};

export function registerNoteLinkCompletionProvider(
  monacoInstance: typeof monaco,
  resolvedLinks: Record<number, string>
) {
  return monacoInstance.languages.registerCompletionItemProvider("markdown", {
    triggerCharacters: ["["],
    async provideCompletionItems(model, position) {
      const lineNumber = position.lineNumber;
      const column = position.column;

      // Get text before and after the cursor on the current line
      const lineContent = model.getLineContent(lineNumber);
      const textBefore = lineContent.slice(0, column - 1);
      const textAfter = lineContent.slice(column - 1);

      // Match [[...]] with cursor in the middle
      const leftMatch = textBefore.match(/\[\[([^\]]*)$/);
      const rightMatch = textAfter.match(/^([^[\]]*)\]\]/);

      if (!leftMatch || !rightMatch) return { suggestions: [] };

      const filter = leftMatch[1] || "";

      const entries = Object.entries(resolvedLinks);

      return {
        suggestions: entries.map(
          ([id, title]) => ({
            label: title,
            kind: monacoInstance.languages.CompletionItemKind.Reference,
            insertText: `${id}`,
            detail: `(${id}) - ${title}`,
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
  const monaco = useMonaco();

  const { handleEditorChange } = useNoteEditor();
  const localNotesList = useSelector(selectLocalNotesList);

  const [content, setContent] = useState(note.content);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const resolvedLinks = useMemo(() => {
    const resolvedLinksMap: Record<number, string> = {};

    for (const note of localNotesList) {
      resolvedLinksMap[note.id] = note.title;
    }

    return resolvedLinksMap;
  }, [localNotesList]);

  // Handle editor mount (configure Markdown mode)
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    // Optional: Add Vim mode
    // import('monaco-vim').then(VimMode => VimMode.VimMode(editor));
  };

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("vim-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "", foreground: "cccccc", background: "000000" }, // Default text
          { token: "comment", foreground: "5c6370" }, // Darker gray comments
          { token: "keyword", foreground: "c678dd" }, // Purple keywords (like Vim's Statement)
          { token: "string", foreground: "98c379" }, // Green strings
          { token: "number", foreground: "d19a66" }, // Orange numbers
          { token: "type", foreground: "e5c07b" }, // Yellow types
          { token: "delimiter", foreground: "abb2bf" }, // Light gray delimiters
          { token: "operator", foreground: "56b6c2" }, // Cyan operators
          { token: "variable", foreground: "e06c75" }, // Red variables
          { token: "function", foreground: "61afef" }, // Blue functions
          { token: "constant", foreground: "d19a66" }, // Orange constants
          { token: "tag", foreground: "e06c75" }, // Red tags (for markdown)
          { token: "attribute", foreground: "d19a66" }, // Orange attributes
        ],
        colors: {
          "editor.background": "#111827", // True black like classic Vim
          "editor.foreground": "#cccccc", // Light gray text
          "editorCursor.foreground": "#ffffff", // Bright white cursor
          "editor.lineHighlightBackground": "#1a1a1a", // Very subtle line highlight
          "editor.selectionBackground": "#264f78", // Blue selection
          "editorLineNumber.foreground": "#4a4a4a", // Dark gray line numbers
          "editorLineNumber.activeForeground": "#888888", // Lighter active line number
          "editor.inactiveSelectionBackground": "#3a3d41", // Inactive selection
          "editorIndentGuide.background": "#2a2a2a", // Indent guides
          "editorIndentGuide.activeBackground": "#3a3a3a", // Active indent guide
          "editorWhitespace.foreground": "#404040", // Whitespace characters
          "editorBracketMatch.background": "#0064001a", // Bracket matching
          "editorBracketMatch.border": "#888888", // Bracket border
        },
      });
      monaco.editor.setTheme("vim-dark");
    }
  }, [monaco]);

  useEffect(() => {
    if (monaco && note?.id) {
      console.log("resolvedLinks:",resolvedLinks);
      const disposable = registerNoteLinkCompletionProvider(monaco, resolvedLinks);
      return () => disposable?.dispose();
    }
  }, [monaco, note?.id, resolvedLinks]);

  const handleEditorUpdate = useCallback(
    (content?: string) => {
      setContent(content || "");
      handleEditorChange({ content, id: note.id });
    },
    [handleEditorChange, note.id]
  );

  const { preview } = useRenderPreview({ resolvedLinks, content });

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={50}>
        <Editor
          height="100%"
          defaultLanguage="markdown"
          theme="vim-dark"
          value={note.content}
          onChange={handleEditorUpdate}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false }, // Customize: No minimap for minimalism
            wordWrap: "on", // Wrap lines
            lineNumbers: "on", // Show line numbers
          }}
        />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <ScrollArea className="h-full rounded-md border">
        <div className="p-4 h-full prose dark:prose-dark markdown-view markdown-body table-cell w-full">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
          >
            {preview}
          </ReactMarkdown>
        </div>

        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
