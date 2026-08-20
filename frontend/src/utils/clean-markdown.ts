import { marked } from "marked";

export async function cleanMarkdown(rawMarkdown: string, title?: string): Promise<string> {
  const processed = rawMarkdown.replace(/\[\[([^\]]+)\]\]/g, (_, t) => t);

  const html = await marked.parse(processed);
  let plainText = html
    .replace(/<[^>]*>/g, " ")  // Strip all HTML tags, replace with space
    .replace(/\s+/g, " ")      // Collapse multiple spaces
    .trim();

  plainText = plainText.replace(/\n{2,}/g, " ");

  if (title) {
    plainText = `${plainText} ${title}`;
  }

  return plainText;
};
