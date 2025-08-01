"use client";

import { PropsWithChildren, useState } from "react";
import { File, FolderOpen } from "lucide-react";
import { Input, ScrollArea } from "devnote/modules";
import { EditorFileList } from "devnote/modules/notes/ui/editor-file-list";

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

type Props = PropsWithChildren<{
	isSometing?: boolean
}>

export function DashboardLayout({ children }: Props) {
  const [selectedFile, setSelectedFile] = useState("README.md");
  const [command, setCommand] = useState("");
  const [mode, setMode] = useState("NORMAL");

  const lines = mockEditorContent.split("\n");

  return (
    <div className="h-screen bg-gray-900 text-green-400 font-mono flex flex-col">
      {/* Main content area */}
      <div className="flex-1 flex">
        {/* Editor area */}
        <div className="flex-1 flex">

          <div className="flex-1 bg-gray-900 py-4 overflow-auto">
						{children}
          </div>
        </div>



        {/* File explorer */}
        <div className="w-64 bg-gray-800 border-l border-gray-700">
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center gap-2 text-gray-400">
              <FolderOpen className="w-4 h-4" />
              <span className="text-sm font-semibold">Notes</span>
            </div>
          </div>

          <EditorFileList />
          <ScrollArea className="h-full">
            <div className="p-2">
              {mockFiles.map((file) => (
                <div
                  key={file.name}
                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-700 transition-colors ${
                    selectedFile === file.name ? "bg-gray-700 text-green-300" : "text-gray-400"
                  }`}
                  onClick={() => setSelectedFile(file.name)}
                >
                  <File className="w-4 h-4" />
                  <span className="text-sm">{file.name}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-1 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-green-400">{selectedFile}</span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400">markdown</span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400">{lines.length} lines</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-yellow-400">-- {mode} --</span>
          <span className="text-gray-400">Ln 1, Col 1</span>
        </div>
      </div>

      {/* Command bar */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center">
          <span className="text-green-400 mr-1">:</span>
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="bg-transparent border-none text-green-400 font-mono text-sm p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Enter command..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Handle command execution here
                console.log("Command:", command);
                setCommand("");
              }
              if (e.key === "Escape") {
                setCommand("");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
