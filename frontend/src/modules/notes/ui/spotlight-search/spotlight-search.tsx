"use client";
import { Button, Dialog, DialogContent, DialogTrigger, Input } from "devnote/modules/shared";
import { Search, File, Folder, ImageIcon, Music } from "lucide-react";
import { useState, useEffect } from "react";
import { SpotlightContent } from "./spotlight-content";

const mockResults = [
  {
    id: 1,
    title: "Project Proposal.docx",
    preview:
      "This document outlines the key objectives and deliverables for the upcoming project initiative, including timeline and resource allocation.",
    type: "document",
    icon: File,
  },
  {
    id: 2,
    title: "Marketing Campaign",
    preview:
      "Comprehensive marketing strategy for Q4 2024 including social media campaigns, email marketing, and influencer partnerships.",
    type: "folder",
    icon: Folder,
  },
  {
    id: 3,
    title: "Design System Guidelines",
    preview:
      "Complete design system documentation covering typography, color palette, spacing, and component specifications for the brand.",
    type: "document",
    icon: File,
  },
  {
    id: 4,
    title: "Team Photo 2024.jpg",
    preview:
      "Annual team photo taken at the company retreat in San Francisco, featuring all department members and leadership team.",
    type: "image",
    icon: ImageIcon,
  },
  {
    id: 5,
    title: "Presentation Audio.mp3",
    preview:
      "Recording of the quarterly business review presentation covering financial performance, market analysis, and strategic initiatives.",
    type: "audio",
    icon: Music,
  },
  {
    id: 6,
    title: "Client Meeting Notes",
    preview:
      "Detailed notes from the client discovery session including requirements, constraints, timeline expectations, and budget discussions.",
    type: "document",
    icon: File,
  },
  {
    id: 7,
    title: "Product Roadmap 2025",
    preview:
      "Strategic product development roadmap outlining feature releases, technical improvements, and user experience enhancements planned for next year.",
    type: "document",
    icon: File,
  },
];

export function SpotlightSearch() {
  const [open, setOpen] = useState(false);
  

  return (
    <div className="">
      <Dialog open={open} onOpenChange={setOpen}>

        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <Search className="w-4 h-4 mr-2" />
            Search...
            <kbd className="ml-auto text-xs bg-gray-800 px-1.5 py-0.5 rounded">⌘K</kbd>
          </Button>
        </DialogTrigger>

        <SpotlightContent
          isOpen={open}
          handleToggle={setOpen} />
      </Dialog>
    </div>
  );
}
