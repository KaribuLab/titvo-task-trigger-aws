export interface TaskDocument {
  scanId: string
  source: string
  args: { [key: string]: string }
  status: string
  createdAt: string
  updatedAt: string
  ttl: number
}
