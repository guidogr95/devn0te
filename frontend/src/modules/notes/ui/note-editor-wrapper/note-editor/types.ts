import { IconName } from "devnote/core/lucide-icons";

export type Divider = {
  type: "divider"
}

export type MenuBarItem = {
  icon: IconName
  title: string
  action: () => void
  isActive?: () => boolean | undefined
}
