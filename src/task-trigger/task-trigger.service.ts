import { Injectable } from '@nestjs/common'
import { TaskTriggerInputDto, TaskTriggerOutputDto } from './task-trigger.dto'
import { ParameterService } from '@shared'
import { BatchService } from '../../shared/src/batch/batch.service'
import { v4 as uuidv4 } from 'uuid'
import { TaskRepository } from '../task/task.repository'
import { TaskArgs, TaskSource, TaskStatus } from '../task/task.domain'
import { ScmStrategyResolver } from '../scm/scm.interface'
import { AuthService } from '../auth/auth.service'
import { createHash } from 'crypto'
import { ActionError } from '../common/common.error'

export class RepositoryIdUndefinedException extends ActionError {
  constructor () {
    super('task-trigger', 'Repository ID is undefined')
  }
}

@Injectable()
export class TaskTriggerService {
  constructor (
    private readonly parameterService: ParameterService,
    private readonly batchService: BatchService,
    private readonly taskRepository: TaskRepository,
    private readonly scmStrategyResolver: ScmStrategyResolver,
    private readonly authService: AuthService
  ) {}

  async process (input: TaskTriggerInputDto): Promise<TaskTriggerOutputDto> {
    const userId = await this.authService.validateApiKey(input.apiKey)
    const source = input.source as TaskSource
    const strategy = await this.scmStrategyResolver.resolve(source)
    const args = await strategy.handle(input.args as TaskArgs)
    const jobQueue = await this.parameterService.get<string>('github-security-scan-job-queue')
    const jobDefinition = await this.parameterService.get<string>('github-security-scan-job-definition')
    const scanId = `tvo-scan-${uuidv4()}`

    // Transformar repository_id a MD5
    const repositoryId = args.repository_id !== undefined
      ? createHash('md5').update(args.repository_id).digest('hex')
      : undefined

    if (repositoryId === undefined) {
      throw new RepositoryIdUndefinedException()
    }

    delete args.repository_id

    await this.taskRepository.putItem({
      scanId,
      source,
      repositoryId: `${userId}:${repositoryId}`,
      status: TaskStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + 3600,
      args
    })
    await this.batchService.submitJob(`${source}-security-scan-${scanId}`, jobQueue, jobDefinition, [
      { name: 'TITVO_SCAN_TASK_ID', value: scanId }
    ])
    return {
      message: 'Scan starting',
      scanId
    }
  }
}
