import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CanvasComponent } from "./canvas-component";

export type CanvasNodeExtensionsOpts = {
  isReadOnly?: boolean
}

export const CanvasNodeExtension = Node.create<CanvasNodeExtensionsOpts>({
  name: "canvasNode",
  group: "block",
  atom: true,

  addOptions() {
    return {
      isReadOnly: false
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        // eslint-disable-next-line quotes
        tag: 'canvas[data-type="canvasNode"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ["canvas", { "data-type": "canvasNode", src: node.attrs.src, ...HTMLAttributes }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CanvasComponent);
  },
});
