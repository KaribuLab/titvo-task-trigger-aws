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

export class RepositoryUrlRequiredError extends ActionError {
  constructor (message: string) {
    super('repository-url-required', message)
    this.name = 'RepositoryUrlRequiredError'
  }
}

export class RepositoryUrlInvalidError extends ActionError {
  constructor (message: string) {
    super('repository-url-invalid', message)
    this.name = 'RepositoryUrlInvalidError'
  }
}

@Injectable()
export class CliStrategy implements ScmStrategy {
  constructor (private readonly taskCliFilesRepository: TaskCliFilesRepository) {}
  supports (taskSource: TaskSource): boolean {
    return taskSource === TaskSource.CLI
  }

  async handle (taskArgs: TaskArgs): Promise<TaskArgs> {
    const { batch_id: batchId, repository_url: repositoryUrl } = taskArgs
    if (batchId === undefined) {
      throw new BatchIdRequiredError('Batch ID is required')
    }
    const files = await this.taskCliFilesRepository.findByBatchId(batchId)
    if (files.length === 0) {
      throw new BatchIdNotFoundError(`Batch ID not found ${batchId}`)
    }
    if (repositoryUrl === undefined) {
      throw new RepositoryUrlRequiredError('Repository URL is required')
    }
    let repositorySlug: string | undefined
    if (repositoryUrl.startsWith('git@')) {
      repositorySlug = repositoryUrl.replace(/^git@[^:]+:(.+)$/, '$1').replace(/\.git$/, '')
    } else if (repositoryUrl.startsWith('http')) {
      repositorySlug = new URL(repositoryUrl).pathname.slice(1).replace(/\.git$/, '')
    }
    if (repositorySlug === undefined) {
      throw new RepositoryUrlInvalidError('Repository URL is invalid')
    }
    return {
      batch_id: batchId,
      repository_slug: repositorySlug
    }
  }
}
