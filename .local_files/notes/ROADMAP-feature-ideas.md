# devn0te — Feature Roadmap & Ideas

This document collects feature ideas in four categories: **Core note-taking**, **Sync & storage connectors**, **AI connectors**, and **Dev/portfolio signal**. Everything is grounded in what already exists in the codebase. The guiding principle is: **the app must work 100% offline with the local SQLite/OPFS DB; any external service is opt-in via a connector**.

---

## Principles

- **Local-first.** The SQLite WASM/OPFS database is the source of truth. The app is fully usable with no network access.
- **Open connectors.** Sync, storage, and AI are plugged in through a common connector interface. Users bring their own credentials/API keys. No vendor is bundled or forced.
- **Self-hostable backend.** The Laravel backend is optional — you can run it yourself or skip it entirely. A connector for it exists the same way one for S3 or Supabase would.
- **Privacy by default.** Nothing leaves the device unless the user explicitly enables a connector.

---

## 1. Core Note-Taking Features

These build directly on what already exists: Monaco editor, FTS + fuzzy search, `[[wikilinks]]`, graph view, console commands.

### 1a. Tags / frontmatter

- YAML frontmatter block at the top of a note: `tags: [project, idea]`, `status: draft`, custom fields.
- Parse tags on save, store in a `note_tags` SQLite table.
- Tag filter in the sidebar. Tag cloud view. Graph nodes colored by tag.
- Console command: `tag-note <title> <tag>`, `list-tags`.

### 1b. Folding / collapsible sections

Monaco already supports code folding. Extend it to Markdown headings (`## Section`) so sections can collapse. This is purely a Monaco editor configuration addition.

### 1c. Note templates

- A `templates/` special folder (or a `template: true` frontmatter flag).
- Console command: `new-note --template <name>` pre-fills content.
- Spotlight shows templates in a separate group.

### 1d. Pinned notes / starred notes

- A `pinned` boolean on the note entity synced to SQLite.
- Pinned notes appear at the top of the file list and as fixed nodes in the graph view.
- Console command: `pin <title>`, `unpin <title>`.

### 1e. Note versioning (local snapshots)

- On every save, write a snapshot row to a `note_versions` SQLite table (timestamp + full content).
- A "History" tab in the note header shows a diff between the current version and any past snapshot.
- Snapshots are pruned to N most recent by default (configurable).

### 1f. Linked mentions panel

The graph already shows connections. Add a sidebar panel (or a fourth tab in `NotePreview`) that lists every note that contains `[[This Note]]` — reverse-index built at sync time from the FTS index already in SQLite.

### 1g. Canvas / spatial board

A free-form canvas where notes are placed as cards, connected by drawn arrows. Think Obsidian Canvas but lighter. Backed by a `canvases` SQLite table storing card positions and connections as JSON. The existing reagraph graph view is the conceptual ancestor.

### 1h. Console: `open`, `rename`, `move` commands

Extend the command registry (`commandRegistry`) with:
- `open <title>` — navigate to a note in the editor.
- `rename <old-title> <new-title>` — already supported in the UI, add a command.
- `move <title> <folder>` — if folders/notebooks are added (see 1a frontmatter).

---

## 2. Sync & Storage Connectors

The backend already has an AWS S3 client registered. A connector system formalises this into a pluggable interface so users can pick where their data lives.

### Connector interface (backend, Laravel)

```
StorageConnector {
  push(notes: Note[]): Promise<void>
  pull(since: DateTime): Promise<Note[]>
  healthCheck(): Promise<bool>
}
```

Each connector is a concrete implementation behind this interface, registered via a Laravel service provider. The user picks one in settings; credentials are stored encrypted (using Laravel's `encrypt()`).

### Connector ideas

| Connector | Notes |
|---|---|
| **Self-hosted Laravel API** | Current behaviour. Opt-in, not default. |
| **S3 / R2 / MinIO** | Store note content as per-note `.md` files. Fast, cheap, works with any S3-compatible endpoint including self-hosted MinIO. Diff/delta logic via ETag + Last-Modified. |
| **Supabase** | Postgres + Realtime. Free tier is generous. Real-time collab would become possible with this connector. |
| **GitHub Gists / repo** | Store notes as `.md` files in a git repo. Free, version-controlled automatically, public or private. Publish a note → it becomes a Gist. |
| **Dropbox / Google Drive** | File-level sync of `.md` files. Familiar to non-technical users. |
| **Azure Blob Storage** | Same pattern as S3. You already know Azure — easy win for the portfolio. |
| **Local folder (desktop PWA)** | Use the File System Access API to sync to a local folder (e.g. Obsidian vault). Notes become plain `.md` files on disk. Zero-dependency local backup. |

### Conflict resolution strategy

Because the app is local-first, conflicts can happen (offline edits + remote edits). A simple strategy:
- **Last-write-wins** by default (timestamp comparison, already in the entity).
- **Manual merge UI** for intentional conflict resolution: side-by-side diff, pick one or merge manually in Monaco.

---

## 3. AI Connector

Any AI feature goes through a single `AIConnector` interface. The user supplies API keys and picks their provider. No API key = all AI features hidden. Works fully offline if the user runs a local model (Ollama).

### AI connector interface

```
AIConnector {
  complete(prompt: string, options?: CompletionOptions): Promise<string>
  embed(text: string): Promise<number[]>   // for semantic search
}
```

### Provider options the user can configure

| Provider | Notes |
|---|---|
| **OpenAI / GPT-4o** | Industry standard. User brings own key. |
| **Anthropic Claude** | Alternative quality choice. |
| **Ollama (local)** | Self-hosted, 100% offline. Point to `localhost:11434`. Best for privacy. |
| **Azure OpenAI** | Same API shape as OpenAI. Good if the user already has an Azure subscription. |
| **Groq / Mistral** | Fast, cheap inference via API. |
| **LM Studio** | Another local option. OpenAI-compatible endpoint. |

### AI Feature ideas

#### 3a. AI writing assistant (inline)

- Slash command inside Monaco: `/ai continue`, `/ai summarise`, `/ai rewrite`, `/ai shorter`.
- Selected text is sent as context. Response streams back into the editor.
- Streaming via `ReadableStream` from the AI connector.

#### 3b. Smart search ("ask your notes")

- A second search mode in Spotlight: `?<natural language query>` prefix instead of plain text.
- Embeds the query using the AI connector, compares against pre-computed note embeddings stored in SQLite (a `note_embeddings` table using a float array column or a JSON blob).
- Falls back to FTS if embedding cost is unwanted.
- This is the most impressive single feature for a portfolio — it demonstrates vector search, embedding pipelines, and RAG in a real product.

#### 3c. Auto-tagging / auto-linking

- On note save, run a background AI call: "Given this note content, suggest 3 tags and 3 existing notes it should link to."
- Suggestions appear as a non-intrusive toast: "Link to [[Project X]]? Add tag #idea?"
- The user can accept or dismiss each suggestion individually.

#### 3d. Note summarisation

- A "Summarise" button in the note header (or console command: `summarise <title>`).
- Generates a 3-sentence summary, stored as a `summary` column on the note (displayed in the graph tooltip or NotePreview).
- Useful in the graph view to understand a node without opening it.

#### 3e. Daily digest

- A console command: `digest` or keyboard shortcut.
- Collects all notes modified in the last 24h, sends them to the AI connector, returns a bullet-point summary of what was worked on.
- Useful for standup notes or end-of-day review.

#### 3f. Chat with a note (RAG)

- A right-hand panel in the editor: "Ask about this note."
- Uses the current note as context window, routes questions to the AI connector.
- The most approachable demo of RAG without needing a vector DB.

---

## 4. Account, Publishing & Monetisation

The guiding constraint: **no note content ever touches devn0te servers**. An account is additive — it adds sync and sharing — but is never required for the core app to work.

### What gets stored per user (minimal)

| Data | Why |
|---|---|
| Account row (email, name, hashed password) | Identity |
| Connector config (encrypted) | Roam cloud/AI connector settings across devices |
| App preferences (theme, shortcuts, sync interval) | Settings sync |
| Published note slugs + content snapshots | Only notes the user explicitly chose to publish |
| Anonymous usage events (feature used, note count bucket) | Aggregate statistics — no content |

### Tiers

#### Tier 0 — No account
Full local app. Every core feature works. This is the pitch: *"No account required. Your notes are yours."*

#### Tier 1 — Free account
- **Settings & connector config roaming.** Without an account, switching devices means re-entering API keys and connector credentials. With an account it roams, encrypted.
- **Published notes.** Opt-in per note. A published note gets a permanent URL at `devn0te.app/@username/note-slug`. Only that snapshot is stored.
- **Public profile.** `devn0te.app/@username` lists their public notes — a lightweight personal knowledge base or writing portfolio.
- **Feature upvotes.** Signed-in users can vote on the public roadmap.

#### Tier 2 — Paid ($3–5/month)
- **Encrypted API key vault.** AI provider keys stored encrypted server-side, synced to every device without the user copying them manually.
- **Published note analytics.** View counts and referrers for public notes.
- **Custom domain for published notes.** `notes.theirdomain.com` proxied to their profile.
- **Priority connector updates** when new storage or AI providers are added.

### Recognition without charging (early stage)

- **GitHub Stars badge** on every published note footer: *"Made with devn0te — ⭐ Star on GitHub"* (optional, on by default). This is how Obsidian Publish and similar tools grew organically.
- **One-time supporter tier** ($5–15 via GitHub Sponsors or a Stripe link). People who like the project can say thank you — no recurring obligation.
- **Show HN / ProductHunt launch.** The local-first + open-source + bring-your-own-AI angle is genuinely novel and pitches well.

### What to avoid
- Never gate a core feature (FTS, graph, editor) behind an account.
- Do not store encrypted note content on the server — it adds liability, complexity, and contradicts the pitch. Cloud backup is the user's connector, not a devn0te service.
- Don't build a paid tier until there are real users. Supporter one-time → free account → paid tier is the right sequence.

---

## 6. Portfolio Signal — What Each Feature Demonstrates

| Feature | Skills signalled |
|---|---|
| Storage connectors | Clean adapter/interface pattern, DDD infrastructure layer, credential encryption |
| S3 / Azure connectors | Cloud storage (AWS + Azure), S3-compatible APIs |
| Supabase connector | Postgres, Realtime, Supabase SDK |
| GitHub connector | OAuth, REST/GraphQL APIs, file-based sync |
| AI connector interface | Abstraction over multiple LLM providers, streaming |
| Semantic search + embeddings | Vector search, embedding pipelines, SQLite with structured data |
| Auto-tagging/linking (AI) | Background jobs, suggestion UX, user trust patterns |
| Note versioning | Diff algorithms, snapshot storage, time-travel UX |
| Local folder sync | File System Access API, BYOD (bring your own directory) |
| Canvas view | Complex frontend state, drag-and-drop, spatial data modelling |
| Tags + frontmatter | YAML parsing, structured metadata, relational SQLite tables |
| Account + published notes | Auth design, encrypted credential storage, public URL routing |
| Paid tier (key vault + analytics) | Stripe integration, multi-tenant encryption, product thinking |

---

## 7. Suggested Sequence

A reasonable order that layers complexity and maximises visible value early:

1. **Tags + frontmatter** — small, high-value, powers several later features.
2. **Note versioning (snapshots)** — purely local, no connector needed, impressive.
3. **Storage connector interface + S3 connector** — unlocks cloud sync, demonstrates AWS skill.
4. **GitHub connector** — demonstrates API integration skill, gives users free backup.
5. **Free account + published notes** — settings roaming and public profiles; gives people a reason to sign up without storing note content.
6. **AI connector + inline writing assistant** — first AI feature, easy to show.
7. **Semantic search (embeddings)** — the flagship AI feature, most portfolio impact.
8. **Paid tier (key vault + analytics)** — only once free users exist.
9. **Supabase connector** — optional, adds real-time collab story.
10. **Canvas view** — ambitious frontend feature, best left for when the core is solid.
