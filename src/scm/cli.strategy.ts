import { Injectable } from '@nestjs/common'
import { TaskArgs, TaskSource } from '../task/task.domain'
import { ScmStrategy } from './scm.interface'
import { TaskCliFilesRepository } from '../task-cli-files/task-cli-files.repository'
import { ActionError } from '../common/common.error'

export class BatchIdNotFoundError extends ActionError {
  constructor (message: string) {
    super('batch-id-not-found', message)
    this.name = 'BatchIdNotFoundError'
  }
}

export class BatchIdRequiredError extends ActionError {
  constructor (message: string) {
    super('batch-id-required', message)
    this.name = 'BatchIdRequiredError'
  }
}

@Injectable()
export class CliStrategy implements ScmStrategy {
  constructor (private readonly taskCliFilesRepository: TaskCliFilesRepository) {}
  supports (taskSource: TaskSource): boolean {
    return taskSource === TaskSource.CLI
  }

  async handle (taskArgs: TaskArgs): Promise<TaskArgs> {
    const { batch_id: batchId } = taskArgs
    if (batchId === undefined) {
      throw new BatchIdRequiredError('Batch ID is required')
    }
    const files = await this.taskCliFilesRepository.findByBatchId(batchId)
    if (files.length === 0) {
      throw new BatchIdNotFoundError(`Batch ID not found ${batchId}`)
    }
    return {
      batch_id: batchId
    }
  }
}
