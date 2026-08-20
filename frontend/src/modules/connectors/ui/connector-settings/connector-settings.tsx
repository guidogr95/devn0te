import { useRef, useState } from "react";
import { useConnectorSettings } from "./use-connector-settings";
import { Button } from "devnote/modules/shared/ui/button/button";
import { exportNotes } from "devnote/modules/notes/utils/export-notes";
import { importNotes } from "devnote/modules/notes/utils/import-notes";
import { useSelector } from "react-redux";
import { RootState } from "devnote/redux/store/store";
import { useDispatch } from "react-redux";
import { AppDispatch } from "devnote/redux/store/store";
import { deltaSyncNotesRequest, getLocalNotesRequest } from "devnote/modules/notes/redux/slice/notes.slice";
import { CONNECTOR_GITHUB_TOKEN_KEY } from "devnote/core/constants/storage";
import LocalStorage from "devnote/core/local-storage";

const tabs = [
  { id: "connectors", label: "Connectors" },
] as const;

type TabId = typeof tabs[number]["id"];

export const ConnectorSettings = () => {
  const activeTab: TabId = "connectors";

  return (
    <div className="flex h-full bg-gray-900 text-green-400 font-mono">
      <aside className="w-48 shrink-0 border-r border-gray-700 flex flex-col pt-6">
        <div className="px-4 mb-4 text-xs text-gray-500 uppercase tracking-widest">Settings</div>
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`px-4 py-2 text-sm cursor-default ${
              activeTab === tab.id
                ? "text-green-400 border-l-2 border-green-500 bg-gray-800"
                : "text-gray-400 border-l-2 border-transparent hover:text-gray-200 hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </div>
        ))}
      </aside>

      <main className="flex-1 overflow-y-auto p-8 max-w-2xl">
        <ConnectorsTab />
      </main>
    </div>
  );
};

const ConnectorsTab = () => {
  const {
    owner,
    setOwner,
    repo,
    setRepo,
    branch,
    setBranch,
    token,
    setToken,
    isSavingConnector,
    hasExistingConnector,
    healthStatus,
    isCheckingHealth,
    lastHealthCheck,
    staleNotes,
    isCheckingStale,
    handleSave,
    handleDelete,
    handleCheckHealth,
    handleCheckStale,
    handleRemoveStale,
  } = useConnectorSettings();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold text-green-400 mb-1">Connectors</h1>
        <p className="text-sm text-gray-400">
          A connector syncs your notes to an external storage target — GitHub, S3, or R2.
          Each note is stored as a <code className="text-green-300 bg-gray-800 px-1 rounded">.md</code> file
          with YAML frontmatter and a UUID <code className="text-green-300 bg-gray-800 px-1 rounded">connector_id</code>.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-200 mb-0.5">GitHub</h2>
          <p className="text-xs text-gray-500 mb-4">
            Pushes notes to a GitHub repo via the Git Trees API — one atomic commit per sync.
            The repo doubles as an Obsidian vault; any <code className="text-green-300 bg-gray-800 px-1 rounded">[[wiki-link]]</code> resolves by title slug.
          </p>

          <div className="bg-gray-800 border border-gray-700 rounded p-4 mb-4 text-xs text-gray-400 space-y-1">
            <div className="text-gray-300 font-semibold mb-2">How it works</div>
            <div>1. On sync, changed notes are committed as <code className="text-green-300">{"{connector_id}-{title}.md"}</code></div>
            <div>2. A manifest <code className="text-green-300">_index.json</code> at repo root tracks all notes + tombstones for deletions.</div>
            <div>3. Pull uses the manifest cursor — only changed files are fetched, not the whole repo.</div>
            <div>4. <span className="text-yellow-400">Token never leaves this device.</span> Non-secret config (owner/repo/branch) is saved server-side per user.</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 uppercase tracking-wide">Repository Owner</label>
            <input
              className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-green-400 focus:outline-none focus:border-green-500 font-mono"
              placeholder="guidogr95"
              value={owner}
              onChange={e => setOwner(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 uppercase tracking-wide">Repository Name</label>
            <input
              className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-green-400 focus:outline-none focus:border-green-500 font-mono"
              placeholder="devnote-sync"
              value={repo}
              onChange={e => setRepo(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 uppercase tracking-wide">Branch</label>
            <input
              className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-green-400 focus:outline-none focus:border-green-500 font-mono"
              placeholder="main"
              value={branch}
              onChange={e => setBranch(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 uppercase tracking-wide">
              Personal Access Token
            </label>
            <p className="text-xs text-yellow-600">
              Needs <code className="text-yellow-500">repo</code> scope.
              Stored in <code className="text-yellow-500">localStorage</code> on this device only — never sent to the server.
              You will be prompted to re-enter it on each new device.
            </p>
            <input
              type="password"
              className="mt-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-green-400 focus:outline-none focus:border-green-500 font-mono"
              placeholder="ghp_••••••••••••••••••••••••••••••••••••••"
              value={token}
              onChange={e => setToken(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={isSavingConnector || !owner || !repo || !branch}
          >
            {isSavingConnector ? "Saving…" : hasExistingConnector ? "Update Connector" : "Enable Connector"}
          </Button>

          {hasExistingConnector && (
            <Button variant="destructive" onClick={handleDelete}>
              Remove
            </Button>
          )}
        </div>

      {hasExistingConnector && (
        <ConnectorStatus
          healthStatus={healthStatus}
          isCheckingHealth={isCheckingHealth}
          lastHealthCheck={lastHealthCheck}
          owner={owner}
          repo={repo}
          branch={branch}
          onCheckHealth={handleCheckHealth}
          missingToken={!LocalStorage.getItem<string>(CONNECTOR_GITHUB_TOKEN_KEY)}
        />
      )}
      </section>

      {hasExistingConnector && (
        <CleanupSection
          staleNotes={staleNotes}
          isCheckingStale={isCheckingStale}
          onCheckStale={handleCheckStale}
          onRemoveStale={handleRemoveStale}
        />
      )}

      <MigrationSection />
    </div>
  );
};

type ConnectorStatusProps = {
  healthStatus: "unknown" | "healthy" | "unhealthy"
  isCheckingHealth: boolean
  lastHealthCheck: string | null
  owner: string
  repo: string
  branch: string
  onCheckHealth: () => void
  missingToken: boolean
}

const ConnectorStatus = ({
  healthStatus,
  isCheckingHealth,
  lastHealthCheck,
  owner,
  repo,
  branch,
  onCheckHealth,
  missingToken,
}: ConnectorStatusProps) => {
  if (missingToken) {
    return (
      <div className="flex flex-col gap-2 text-xs bg-yellow-900/30 border border-yellow-700 rounded p-4">
        <div className="flex items-center gap-2 text-yellow-400 font-semibold">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" />
          <span>GitHub token missing</span>
        </div>
        <p className="text-yellow-500">
          The personal access token was cleared from this device. Enter your token above and click
          Update Connector to resume syncing.
        </p>
      </div>
    );
  }

  const dot =
    healthStatus === "healthy"
      ? "bg-green-500"
      : healthStatus === "unhealthy"
      ? "bg-red-500"
      : "bg-gray-500";

  const label =
    healthStatus === "healthy"
      ? "Reachable"
      : healthStatus === "unhealthy"
      ? "Unreachable"
      : "Unknown";

  return (
    <div className="flex flex-col gap-2 text-xs text-gray-400">
      <div className="flex items-center gap-2">
        <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />
        <span>
          {isCheckingHealth ? "Checking…" : label}
          {" — "}
          notes will sync to <code className="text-green-400">{owner}/{repo}@{branch}</code>
        </span>
      </div>
      <div className="flex items-center gap-3">
        {lastHealthCheck && (
          <span className="text-gray-600">
            Last checked: {new Date(lastHealthCheck).toLocaleTimeString()}
          </span>
        )}
        <button
          className="text-gray-500 hover:text-gray-300 underline underline-offset-2 disabled:opacity-40"
          disabled={isCheckingHealth}
          onClick={onCheckHealth}
        >
          Test connection
        </button>
      </div>
    </div>
  );
};

type CleanupSectionProps = {
  staleNotes: { connectorId: string; title: string }[] | null
  isCheckingStale: boolean
  onCheckStale: () => void
  onRemoveStale: () => void
}

const CleanupSection = ({
  staleNotes,
  isCheckingStale,
  onCheckStale,
  onRemoveStale,
}: CleanupSectionProps) => {
  return (
    <section className="flex flex-col gap-3 border-t border-gray-700 pt-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-200 mb-0.5">Cleanup</h2>
        <p className="text-xs text-gray-500">
          Find notes that exist in your local SQLite but were deleted from the remote connector.
          These notes will not be re-pushed, but they take up local space.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onCheckStale} disabled={isCheckingStale}>
          {isCheckingStale ? "Checking…" : "Check for stale notes"}
        </Button>
      </div>

      {staleNotes !== null && staleNotes.length === 0 && (
        <p className="text-xs text-green-600">No stale notes found.</p>
      )}

      {staleNotes !== null && staleNotes.length > 0 && (
        <div className="flex flex-col gap-2">
          <ul className="text-xs text-gray-400 space-y-1 max-h-40 overflow-y-auto bg-gray-800 border border-gray-700 rounded p-3">
            {staleNotes.map(n => (
              <li key={n.connectorId} className="truncate">{n.title}</li>
            ))}
          </ul>
          <Button variant="destructive" onClick={onRemoveStale}>
            Remove {staleNotes.length} stale {staleNotes.length === 1 ? "note" : "notes"}
          </Button>
        </div>
      )}
    </section>
  );
};

const MigrationSection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; failed: number } | null>(null);

  async function handleExport() {
    if (!user) return;
    setIsExporting(true);
    try {
      await exportNotes(user.id);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setIsImporting(true);
    setImportResult(null);
    try {
      if (!user) return;
      const result = await importNotes(files, user.id);
      setImportResult(result);
      dispatch(getLocalNotesRequest());
      dispatch(deltaSyncNotesRequest(user.id));
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <section className="flex flex-col gap-3 border-t border-gray-700 pt-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-200 mb-0.5">Migration</h2>
        <p className="text-xs text-gray-500">
          Export all notes as a <code className="text-green-300 bg-gray-800 px-1 rounded">.zip</code> of
          Markdown files, or import <code className="text-green-300 bg-gray-800 px-1 rounded">.md</code> files
          with YAML frontmatter into your local notes.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <Button onClick={handleExport} disabled={isExporting || !user}>
            {isExporting ? "Exporting…" : "Export all notes (.zip)"}
          </Button>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 uppercase tracking-wide">Import .md files</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md"
            multiple
            className="text-xs text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-gray-700 file:text-gray-300 file:cursor-pointer hover:file:bg-gray-600 disabled:opacity-40"
            disabled={isImporting}
            onChange={handleImport}
          />
          {isImporting && <p className="text-xs text-gray-500">Importing…</p>}
          {importResult && (
            <p className="text-xs text-green-600">
              Imported {importResult.imported} note{importResult.imported !== 1 ? "s" : ""}
              {importResult.failed > 0 && (
                <span className="text-yellow-500"> ({importResult.failed} failed)</span>
              )}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
