export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface TaskDocument {
  scanId: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
  ttl: number
}
