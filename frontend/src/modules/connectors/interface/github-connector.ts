import { SyncConnector, ConnectorNote, ConnectorPullResult } from "../core/sync-connector";
import { normalizeTitle } from "devnote/utils/normalize-title";

const GITHUB_API = "https://api.github.com";
const INDEX_PATH = "_index.json";

type GitHubConfig = {
  owner: string
  repo: string
  branch: string
  token: string
}

type ManifestEntry = {
  connector_id: string
  filename: string
  title: string
  updated_at: string
}

type IndexManifest = {
  synced_at: string
  notes: ManifestEntry[]
  deleted_ids: string[]
}

type GitTreeEntry = {
  path: string
  mode: "100644"
  type: "blob"
  content?: string
  sha?: string | null
}

export class GitHubConnector implements SyncConnector {
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  private get headers() {
    return {
      "Authorization": `Bearer ${this.config.token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }

  private apiUrl(path: string) {
    return `${GITHUB_API}/repos/${this.config.owner}/${this.config.repo}/${path}`;
  }

  async healthCheck(): Promise<boolean> {
    const res = await fetch(this.apiUrl(`git/refs/heads/${this.config.branch}`), {
      headers: this.headers,
    });
    return res.ok;
  }

  async listManifest(): Promise<{ notes: { connectorId: string; title: string }[] }> {
    const manifest = await this.fetchIndex();
    if (!manifest) return { notes: [] };
    return {
      notes: manifest.notes.map(e => ({ connectorId: e.connector_id, title: e.title })),
    };
  }

  async pull(localCursor: string | null): Promise<ConnectorPullResult> {
    const manifest = await this.fetchIndex();

    if (!manifest) {
      return { notes: [], deleted: [], cursor: new Date().toISOString() };
    }

    const cursor = new Date(localCursor ?? "1970-01-01T00:00:00.000Z");
    const manifestSyncedAt = new Date(manifest.synced_at);

    if (localCursor && manifestSyncedAt <= cursor) {
      return { notes: [], deleted: [], cursor: localCursor };
    }

    const toFetch = manifest.notes.filter(
      (entry) => new Date(entry.updated_at) > cursor
    );

    const notes: ConnectorNote[] = [];
    for (const entry of toFetch) {
      const res = await fetch(
        this.apiUrl(`contents/${encodeURIComponent(entry.filename)}?ref=${this.config.branch}`),
        { headers: this.headers }
      );
      if (!res.ok) continue;
      const data = await res.json() as { content: string };
      const raw = atob(data.content.replace(/\n/g, ""));
      const parsed = parseFrontmatter(raw);
      if (!parsed || !parsed.frontmatter["connector_id"]) continue;
      notes.push({
        connectorId: parsed.frontmatter["connector_id"],
        title: parsed.frontmatter["title"] ?? entry.title,
        content: parsed.body,
        updatedAt: parsed.frontmatter["updated_at"] ?? entry.updated_at,
      });
    }

    const deleted = localCursor ? manifest.deleted_ids : [];
    return { notes, deleted, cursor: manifest.synced_at };
  }

  async push(changedNotes: ConnectorNote[], deletedIds: string[]): Promise<void> {
    if (changedNotes.length === 0 && deletedIds.length === 0) return;

    const now = new Date().toISOString();

    let headSha: string;
    let treeSha: string;

    const refRes = await fetch(
      this.apiUrl(`git/refs/heads/${this.config.branch}`),
      { headers: this.headers }
    );

    if (refRes.status === 404) {
      const emptyTreeRes = await fetch(this.apiUrl("git/trees"), {
        method: "POST",
        headers: { ...this.headers, "Content-Type": "application/json" },
        body: JSON.stringify({ tree: [] }),
      });
      if (!emptyTreeRes.ok) throw new Error(`GitHub create empty tree failed: ${emptyTreeRes.status}`);
      const emptyTreeData = await emptyTreeRes.json() as { sha: string };

      const initCommitRes = await fetch(this.apiUrl("git/commits"), {
        method: "POST",
        headers: { ...this.headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "devn0te: initialize",
          tree: emptyTreeData.sha,
          parents: [],
        }),
      });
      if (!initCommitRes.ok) throw new Error(`GitHub create init commit failed: ${initCommitRes.status}`);
      const initCommitData = await initCommitRes.json() as { sha: string };

      const createRefRes = await fetch(this.apiUrl("git/refs"), {
        method: "POST",
        headers: { ...this.headers, "Content-Type": "application/json" },
        body: JSON.stringify({ ref: `refs/heads/${this.config.branch}`, sha: initCommitData.sha }),
      });
      if (!createRefRes.ok) throw new Error(`GitHub create ref failed: ${createRefRes.status}`);

      headSha = initCommitData.sha;
      treeSha = emptyTreeData.sha;
    } else if (!refRes.ok) {
      throw new Error(`GitHub ref fetch failed: ${refRes.status}`);
    } else {
      const refData = await refRes.json() as { object: { sha: string } };
      headSha = refData.object.sha;

      const commitRes = await fetch(
        this.apiUrl(`git/commits/${headSha}`),
        { headers: this.headers }
      );
      if (!commitRes.ok) throw new Error(`GitHub commit fetch failed: ${commitRes.status}`);
      const commitData = await commitRes.json() as { tree: { sha: string } };
      treeSha = commitData.tree.sha;
    }

    const currentManifest: IndexManifest = (await this.fetchIndex()) ?? {
      synced_at: now,
      notes: [],
      deleted_ids: [],
    };

    const treeEntries: GitTreeEntry[] = [];

    for (const note of changedNotes) {
      const slug = normalizeTitle(note.title);
      const filename = `${note.connectorId}-${slug}.md`;
      treeEntries.push({ path: filename, mode: "100644", type: "blob", content: buildNoteFile(note) });

      const existingIdx = currentManifest.notes.findIndex(
        (n) => n.connector_id === note.connectorId
      );
      const entry: ManifestEntry = {
        connector_id: note.connectorId,
        filename,
        title: note.title,
        updated_at: note.updatedAt ?? now,
      };

      if (existingIdx >= 0) {
        const old = currentManifest.notes[existingIdx];
        if (old.filename !== filename) {
          treeEntries.push({ path: old.filename, mode: "100644", type: "blob", sha: null });
        }
        currentManifest.notes[existingIdx] = entry;
      } else {
        currentManifest.notes.push(entry);
      }
    }

    for (const connectorId of deletedIds) {
      const idx = currentManifest.notes.findIndex(
        (n) => n.connector_id === connectorId
      );
      if (idx >= 0) {
        treeEntries.push({ path: currentManifest.notes[idx].filename, mode: "100644", type: "blob", sha: null });
        currentManifest.notes.splice(idx, 1);
      }
      if (!currentManifest.deleted_ids.includes(connectorId)) {
        currentManifest.deleted_ids.push(connectorId);
      }
    }

    currentManifest.synced_at = now;
    treeEntries.push({
      path: INDEX_PATH,
      mode: "100644",
      type: "blob",
      content: JSON.stringify(currentManifest, null, 2),
    });

    const newTreeRes = await fetch(this.apiUrl("git/trees"), {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify({ base_tree: treeSha, tree: treeEntries }),
    });
    if (!newTreeRes.ok) throw new Error(`GitHub create tree failed: ${newTreeRes.status}`);
    const newTreeData = await newTreeRes.json() as { sha: string };

    const newCommitRes = await fetch(this.apiUrl("git/commits"), {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `devn0te sync: ${now}`,
        tree: newTreeData.sha,
        parents: [headSha],
      }),
    });
    if (!newCommitRes.ok) throw new Error(`GitHub create commit failed: ${newCommitRes.status}`);
    const newCommitData = await newCommitRes.json() as { sha: string };

    const updateRefRes = await fetch(
      this.apiUrl(`git/refs/heads/${this.config.branch}`),
      {
        method: "PATCH",
        headers: { ...this.headers, "Content-Type": "application/json" },
        body: JSON.stringify({ sha: newCommitData.sha }),
      }
    );
    if (!updateRefRes.ok) throw new Error(`GitHub update ref failed: ${updateRefRes.status}`);
  }

  private async fetchIndex(): Promise<IndexManifest | null> {
    const res = await fetch(
      this.apiUrl(`contents/${INDEX_PATH}?ref=${this.config.branch}`),
      { headers: this.headers }
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub fetch index failed: ${res.status}`);
    const data = await res.json() as { content: string };
    return JSON.parse(atob(data.content.replace(/\n/g, ""))) as IndexManifest;
  }
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, string>; body: string } | null {
  const match = raw.match(/^---\n([\s\S]+?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    frontmatter[line.slice(0, colonIdx).trim()] = line.slice(colonIdx + 1).trim();
  }
  return { frontmatter, body: match[2] };
}

function buildNoteFile(note: ConnectorNote): string {
  return `---\nconnector_id: ${note.connectorId}\ntitle: ${note.title}\nupdated_at: ${note.updatedAt}\n---\n${note.content ?? ""}`;
}
