"use client";

import { useState } from "react";
import { File, FolderOpen } from "lucide-react";
import { Input, ScrollArea } from "devnote/modules/shared";
import { MonacoNoteEditor } from "./monaco-note-editor";

// Mock data for the file explorer
const mockFiles = [
  { name: "README.md", type: "file" },
  { name: "daily-notes.md", type: "file" },
  { name: "project-ideas.md", type: "file" },
  { name: "meeting-notes.md", type: "file" },
  { name: "todo.md", type: "file" },
  { name: "vim-shortcuts.md", type: "file" },
  { name: "learning-notes.md", type: "file" },
];

// Mock editor content
const mockEditorContent = `# Welcome to VimNotes

This is a vim-inspired note-taking application.

## Features
- Vim-like interface
- Markdown support
- File explorer
- Command mode

## Usage
Use the command bar at the bottom to navigate and execute commands.

### Common Commands
- :w - save file
- :q - quit
- :wq - save and quit
- :e filename - edit file

---

Start typing your notes here...`;

export function MonacoNoteEditorWrapper() {

	
  
	return <MonacoNoteEditor 
		initialContent=""
		onSave={() => {}}/>;
}
