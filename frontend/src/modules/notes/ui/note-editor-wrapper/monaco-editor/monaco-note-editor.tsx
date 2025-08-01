"use-client";
import { useEffect, useRef, useState } from "react"; 
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "devnote/modules/shared/ui/resizable";
import Editor, { useMonaco } from "@monaco-editor/react";
import "github-markdown-css/github-markdown.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

type Props = {
	initialContent: string
	onSave: (content: string) => void 
}

export const MonacoNoteEditor = ({
	initialContent,
	onSave
}: Props) => {
	const monaco = useMonaco();
	const [content, setContent] = useState(initialContent);
  const [preview, setPreview] = useState(initialContent);
  const editorRef = useRef<any>(null);

  // Handle editor mount (configure Markdown mode)
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    // Optional: Add Vim mode
    // import('monaco-vim').then(VimMode => VimMode.VimMode(editor));
  };


	useEffect(() => {
    if (monaco) {
			console.log("monaco:",monaco);
      monaco.editor.defineTheme("vim-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "", foreground: "cccccc", background: "000000" },  // Default text
          { token: "comment", foreground: "5c6370" },  // Darker gray comments
          { token: "keyword", foreground: "c678dd" },  // Purple keywords (like Vim's Statement)
          { token: "string", foreground: "98c379" },  // Green strings
          { token: "number", foreground: "d19a66" },  // Orange numbers
          { token: "type", foreground: "e5c07b" },  // Yellow types
          { token: "delimiter", foreground: "abb2bf" },  // Light gray delimiters
          { token: "operator", foreground: "56b6c2" },  // Cyan operators
          { token: "variable", foreground: "e06c75" },  // Red variables
          { token: "function", foreground: "61afef" },  // Blue functions
          { token: "constant", foreground: "d19a66" },  // Orange constants
          { token: "tag", foreground: "e06c75" },  // Red tags (for markdown)
          { token: "attribute", foreground: "d19a66" },  // Orange attributes
        ],
        colors: {
          "editor.background": "#111827",  // True black like classic Vim
          "editor.foreground": "#cccccc",  // Light gray text
          "editorCursor.foreground": "#ffffff",  // Bright white cursor
          "editor.lineHighlightBackground": "#1a1a1a",  // Very subtle line highlight
          "editor.selectionBackground": "#264f78",  // Blue selection
          "editorLineNumber.foreground": "#4a4a4a",  // Dark gray line numbers
          "editorLineNumber.activeForeground": "#888888",  // Lighter active line number
          "editor.inactiveSelectionBackground": "#3a3d41",  // Inactive selection
          "editorIndentGuide.background": "#2a2a2a",  // Indent guides
          "editorIndentGuide.activeBackground": "#3a3a3a",  // Active indent guide
          "editorWhitespace.foreground": "#404040",  // Whitespace characters
          "editorBracketMatch.background": "#0064001a",  // Bracket matching
          "editorBracketMatch.border": "#888888",  // Bracket border
        },
      });
			monaco.editor.setTheme("vim-dark");
    }
  }, [monaco]);


	useEffect(() => {
		console.log("content:",content);
    const timer = setTimeout(() => {
      setPreview(content);  // Update preview
      onSave(content);  // Auto-save (debounced)
    }, 1000);  // 1s debounce

    return () => clearTimeout(timer);
  }, [content, onSave]);

	return (
		<ResizablePanelGroup direction="horizontal">
			<ResizablePanel defaultSize={50}>
				<Editor
					height="100%"
					defaultLanguage="markdown"
          theme="vim-dark"
					value={content}
					onChange={(value) => setContent(value || "")}
          onMount={handleEditorDidMount}
					options={{
            minimap: { enabled: false },  // Customize: No minimap for minimalism
            wordWrap: "on",  // Wrap lines
            lineNumbers: "on",  // Show line numbers
          }}/>
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel defaultSize={50}>
				<div className="preview-pane markdown-body">
					<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
						{preview}
					</ReactMarkdown>
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};
