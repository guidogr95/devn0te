import { icons } from "lucide-react";
import * as Icons from "lucide-react";

type DynamicIconProps = {
  iconName: keyof typeof icons;
  size?: number;
  color?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ iconName, size = 24, color = "currentColor" }) => {
  const LucideIcon = Icons[iconName];

  if (!LucideIcon) {
    return <div>Icon not found</div>;
  }

  return <LucideIcon size={size} color={color} />;
};
