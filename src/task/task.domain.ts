export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ERROR = 'ERROR'
}

export enum TaskSource {
  GITHUB = 'github',
  BITBUCKET = 'bitbucket',
  GITLAB = 'gitlab',
  CLI = 'cli',
}

export interface TaskArgs {
  [key: string]: string
}

export interface Task {
  id?: string
  source: TaskSource
  args: TaskArgs
  status: TaskStatus
}
