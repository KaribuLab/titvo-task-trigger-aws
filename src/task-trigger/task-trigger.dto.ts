class TaskTriggerInput {
  apiKey?: string
  source: string
  args: { [key: string]: string }
}

class TaskTriggerOutput {
  message: string
  scanId: string
}

export { TaskTriggerInput as TaskTriggerInputDto, TaskTriggerOutput as TaskTriggerOutputDto }
