"use client";
import { PropsWithChildren, useState } from "react";
import { Input } from "devnote/modules";
import { FileExplorer } from "devnote/modules/notes/ui/file-explorer";


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
      <div className="flex-1 flex overflow-hidden">
        {/* Editor area */}
        <div className="flex-1 flex relative">

          <div className="flex-1 bg-gray-900 py-4 overflow-auto">
						{children}
          </div>
        </div>
        <FileExplorer />
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
