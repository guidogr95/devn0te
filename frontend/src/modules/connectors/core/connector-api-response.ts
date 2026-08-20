type GitHubConnectorApiEntry = {
  type: "github"
  settings: {
    owner: string
    repo: string
    branch: string
  }
}

export type ConnectorApiEntry = GitHubConnectorApiEntry

export type GetConnectorsResponse = {
  connectors: ConnectorApiEntry[]
}

export type SaveConnectorResponse = {
  connector: ConnectorApiEntry
}
