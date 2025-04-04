export interface TaskDocument {
  scanId: string
  source: string
  repository: string
  args: { [key: string]: string }
  status: string
  createdAt: string
  updatedAt: string
  ttl: number
}
