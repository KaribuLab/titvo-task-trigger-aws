export interface TaskDocument {
  scanId: string
  repositoryId: string
  source: string
  args: { [key: string]: string }
  status: string
  createdAt: string
  updatedAt: string
  ttl: number
}
