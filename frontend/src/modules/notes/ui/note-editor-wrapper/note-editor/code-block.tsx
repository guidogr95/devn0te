import { NodeViewContent, NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { ScrollArea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "devnote/modules/shared";

export const CodeBlock = ({
	node: {
		attrs: { language: defaultLanguage }
	},
	updateAttributes,
	extension
}: NodeViewProps) => (
  <NodeViewWrapper className="code-block">
    <Select
      defaultValue={defaultLanguage} 
      onValueChange={(value) => updateAttributes({ language: value })}
    >
      <SelectTrigger className="w-[180px] bg-background text-foreground border-input absolute right-2 top-2">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent className="bg-popover text-popover-foreground">
        <ScrollArea className="h-[200px]">
          <SelectItem value="null" className="text-muted-foreground">auto</SelectItem>
          <SelectItem value="disabled" disabled>—</SelectItem>
          {extension.options.lowlight.listLanguages().map((lang: string) => (
            <SelectItem key={lang} value={lang}>
              {lang}
            </SelectItem>
          ))}
        </ScrollArea>
      </SelectContent>
    </Select>
    <pre>
      <NodeViewContent as="code" />
    </pre>
  </NodeViewWrapper>
);
