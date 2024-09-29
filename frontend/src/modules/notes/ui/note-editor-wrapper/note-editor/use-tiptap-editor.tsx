import { useEffect } from "react";
import { Content, useCurrentEditor } from "@tiptap/react";

type Props = {
	content: Content
	id?: number
}

export function useTiptapEditor({
	content,
	id
}: Props) {

	const { editor } = useCurrentEditor();

  useEffect(() => {
    if (editor && editor.isEditable) {
			setTimeout(() => {
				editor.commands.setContent(`${content}`);
			}, 100);
    }
  }, [id]);

	return {
		editor
	};
};
