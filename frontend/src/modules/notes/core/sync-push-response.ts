export type SyncPushResponse = {
  created: { id: number; connector_id: string }[]
  errors: string[]
}
