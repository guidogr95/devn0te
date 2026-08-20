import { ConnectorSettings, SyncConnector } from "../core/sync-connector";
import { GitHubConnector } from "./github-connector";
import LocalStorage from "devnote/core/local-storage";
import { CONNECTOR_GITHUB_TOKEN_KEY } from "devnote/core/constants/storage";

export function getConnector(settings: ConnectorSettings | null): SyncConnector | null {
  if (!settings) return null;

  if (settings.type === "github") {
    const token = LocalStorage.getItem<string>(CONNECTOR_GITHUB_TOKEN_KEY);
    if (!token) return null;
    return new GitHubConnector({ ...settings, token });
  }

  return null;
}
