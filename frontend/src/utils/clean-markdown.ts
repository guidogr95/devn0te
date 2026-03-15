import { marked } from "marked";

export async function cleanMarkdown(rawMarkdown: string, replacementMap: Record<number, string>, title?: string): Promise<string> {
  
  // Step 1: Pre-process [[number]] with regex (unchanged)
  const processed = rawMarkdown.replace(/\[\[(\d+)\]\]/g, (match, numberStr) => {
    const num = parseInt(numberStr, 10);
    return replacementMap[num] ? replacementMap[num] : match;
  });

  // Step 2: Parse Markdown to HTML using marked, then strip tags to plain text
  const html = await marked.parse(processed);  // Outputs HTML string
  let plainText = html
    .replace(/<[^>]*>/g, " ")  // Strip all HTML tags, replace with space
    .replace(/\s+/g, " ")      // Collapse multiple spaces
    .trim();

  // Step 3: Additional cleaning (e.g., collapse newlines; adjusted for plain text)
  plainText = plainText.replace(/\n{2,}/g, " ");

  // Optional: Append title
  if (title) {
    plainText = `${plainText} ${title}`;
  }

  return plainText;
};
