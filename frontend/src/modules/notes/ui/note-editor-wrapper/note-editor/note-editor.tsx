import { EditorProvider, ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Highlight } from "@tiptap/extension-highlight";
import { TaskList } from "@tiptap/extension-task-list";
import CharacterCount from "@tiptap/extension-character-count";
import { TaskItem } from "@tiptap/extension-task-item";
import StarterKit from "@tiptap/starter-kit";
import { useNoteEditor } from "./use-note-editor";
import { NoteEntity } from "devnote/modules/notes/core/entity/note.entity";
import { all, createLowlight } from "lowlight";
import { CodeBlock } from "./code-block";
import { TiptapEditor } from "./tiptap-editor";
import { NoteEditorHeader } from "./note-editor-header";

import "devnote/styles/tiptap.css";
import "./note-editor.css";
import { CanvasNodeExtension } from "./canvas-node-extension";

const lowlight = createLowlight(all);

const extensions = [
	StarterKit,
	CanvasNodeExtension,
	Highlight,
	TaskList,
	TaskItem,
	CharacterCount.configure({
		limit: 10000,
	}),
	CodeBlockLowlight
	.extend({
		addNodeView() {
			return ReactNodeViewRenderer(CodeBlock);
		},
	})
	.configure({ lowlight }),
];

type Props = {
	note: NoteEntity
}

export const NoteEditor = ({ note }: Props) => {

	const {
		handleEditorChange,
		titleRef
	} = useNoteEditor();
	
	return (
		<div className="flex-1 flex flex-col bg-bg-secondary h-full rounded-3xl overflow-hidden border border-bg-primary editor-provider-wrapper">
			<EditorProvider
				editorProps={{
					attributes: {
						class: "h-full overflow-y-scroll"
					}
				}}
				extensions={extensions}
				onUpdate={({editor}) => handleEditorChange({ content: editor.getHTML(), id: note.id, title: titleRef.current })}
				slotBefore={
					<NoteEditorHeader
						titleRef={titleRef}
						handleEditorChange={handleEditorChange}/>
				}>
				<TiptapEditor content={note.content} id={note.id} />
			</EditorProvider>
		</div>
	);
};

