import Fuse from "fuse.js";

type Searchable = {
  id: number
  title: string
};

export function fuzzySearch<T extends Searchable>(query: string, items: T[]): T[] {
  if (!query.trim()) return [];
  const fuse = new Fuse(items, { keys: ["title"], threshold: 0.4 });
  return fuse.search(query).map(r => r.item);
}
