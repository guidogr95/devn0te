import { useCallback, useMemo } from "react";

type Props = {
	content: string
	titleToConnectorId: Record<string, string>
}

export const useRenderPreview = ({
	content,
	titleToConnectorId
}: Props) => {

	const renderWithResolvedLinks = useCallback((content: string, titleToConnectorId: Record<string, string>): string => {
    return content.replace(/\[\[([^\]]+)\]\]/g, (_match, title) => {
      const connectorId = titleToConnectorId[title];
      if (connectorId) {
        return `[${title}](devnote://note/${connectorId})`;
      } else {
        return `<span class="wiki-link-broken">[[${title}]]</span>`;
      }
    });
  }, []);

	const preview = useMemo(() => renderWithResolvedLinks(content, titleToConnectorId), [content, renderWithResolvedLinks, titleToConnectorId]);


	return {
		preview
	};
};
