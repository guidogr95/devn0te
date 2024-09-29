import { Content, EditorContent } from "@tiptap/react";
import { useTiptapEditor } from "./use-tiptap-editor";

export const TiptapEditor = ({ content, id }: { content: Content, id?: number }) => {
	
	const { editor } = useTiptapEditor({ content, id });

  return <EditorContent editor={editor} contentEditable={false} />;
};
