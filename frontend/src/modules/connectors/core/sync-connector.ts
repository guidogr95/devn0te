export type ConnectorNote = {
  connectorId: string
  title: string
  content: string
  updatedAt: string
}

export type ConnectorPullResult = {
  notes: ConnectorNote[]
  deleted: string[]
  cursor: string
}

export type SyncConnector = {
  pull(localCursor: string | null): Promise<ConnectorPullResult>
  push(changedNotes: ConnectorNote[], deletedIds: string[]): Promise<void>
  healthCheck(): Promise<boolean>
  listManifest(): Promise<{ notes: { connectorId: string; title: string }[] }>
}

export type GitHubConnectorSettings = {
  type: "github"
  owner: string
  repo: string
  branch: string
}

export type ConnectorSettings = GitHubConnectorSettings
