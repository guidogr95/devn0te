import { useCallback, useMemo } from "react";

type Props = {
	content: string
	resolvedLinks: Record<number, string>
}

export const useRenderPreview = ({
	content,
	resolvedLinks
}: Props) => {

	const renderWithResolvedLinks = useCallback((content: string, resolvedLinks: Record<number, string>): string => {
    return content.replace(/\[\[(\d+)\]\]/g, (match, idStr) => {
      const id = Number(idStr);
      const title = resolvedLinks[id];
      if (title) {
        return `[[${title}:${id}]]`;
      } else {
        return `[[${id}]] #invalid link note id`;
      }
    });
  }, []);

	const preview = useMemo(() => renderWithResolvedLinks(content, resolvedLinks), [content, renderWithResolvedLinks, resolvedLinks]);


	return {
		preview
	};
};
