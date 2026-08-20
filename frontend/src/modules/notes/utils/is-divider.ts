import { Divider } from "../ui/note-editor-wrapper/note-editor/types";

export function isDivider(item: unknown): item is Divider {
  return (item as Divider).type === "divider";
}
