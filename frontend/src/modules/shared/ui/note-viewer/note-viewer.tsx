import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import {
  Content,
  EditorContent,
  EditorProvider,
  Extensions,
  ReactNodeViewRenderer,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CodeBlock } from "devnote/modules/notes/ui/note-editor-wrapper/note-editor/code-block";
import { TiptapEditor } from "devnote/modules/notes/ui/note-editor-wrapper/note-editor/tiptap-editor";

import "devnote/styles/tiptap.css";
import { all, createLowlight } from "lowlight";

type Props = {
  content: Content;
};

const lowlight = createLowlight(all);

const extensions: Extensions = [
	StarterKit,
	TaskList,
	TaskItem,
	CharacterCount.configure({
		limit: 10_000,
	}),
	CodeBlockLowlight
	.extend({
		addNodeView() {
			return ReactNodeViewRenderer(CodeBlock);
		},
	})
	.configure({ lowlight }),
];

export const NoteViewer = ({ content }: Props) => {

  return (
    <div>
      <EditorProvider
        extensions={extensions}
      >
        <TiptapEditor content={content} />
      </EditorProvider>
    </div>
  );
};
