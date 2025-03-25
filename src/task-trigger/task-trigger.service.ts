import { Injectable } from '@nestjs/common'
import { TaskTriggerInputDto, TaskTriggerOutputDto } from './task-trigger.dto'
import { ParameterService } from '@shared'
import { BatchService } from '../../shared/src/batch/batch.service'
import { v4 as uuidv4 } from 'uuid'
import { ApiKeyNotFoundError } from './task-trigger.error'
import { TaskRepository } from '../task/task.repository'
import { TaskArgs, TaskSource, TaskStatus } from '../task/task.domain'
import { ScmStrategyResolver } from '../scm/scm.interface'
@Injectable()
export class TaskTriggerService {
  constructor (private readonly parameterService: ParameterService, private readonly batchService: BatchService, private readonly taskRepository: TaskRepository, private readonly scmStrategyResolver: ScmStrategyResolver) {}
  async process (input: TaskTriggerInputDto): Promise<TaskTriggerOutputDto> {
    if (input.apiKey === undefined) {
      throw new ApiKeyNotFoundError('API key not found')
    }
    // FIXME: Use table for authorized API keys
    // Aquí iría la validación del API key contra una tabla de claves autorizadas
    const strategy = await this.scmStrategyResolver.resolve(input.source as TaskSource)
    const jobQueue = await this.parameterService.get<string>('github-security-scan-job-queue')
    const jobDefinition = await this.parameterService.get<string>('github-security-scan-job-definition')
    const scanId = `tvo-scan-${uuidv4()}`
    await this.taskRepository.putItem({
      scanId,
      status: TaskStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + 3600,
      args: await strategy.handle(input.args as TaskArgs)
    })
    await this.batchService.submitJob(`github-security-scan-${scanId}`, jobQueue, jobDefinition, [
      { name: 'TITVO_SCAN_TASK_ID', value: scanId }
    ])
    return {
      message: 'Scan starting',
      scanId
    }
  }
}
