class TaskTriggerInput {
  apiKey?: string
  githubToken: string
  githubRepoName: string
  githubCommitSha: string
  githubAssignee: string
}

class TaskTriggerOutput {
  message: string
  taskId: string
}

export { TaskTriggerInput as TaskTriggerInputDto, TaskTriggerOutput as TaskTriggerOutputDto }
