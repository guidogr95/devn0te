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
        return `[${title}](devnote://note/${id})`;
      } else {
        return `<span class="wiki-link-broken">[[${id}]]</span>`;
      }
    });
  }, []);

	const preview = useMemo(() => renderWithResolvedLinks(content, resolvedLinks), [content, renderWithResolvedLinks, resolvedLinks]);


	return {
		preview
	};
};
