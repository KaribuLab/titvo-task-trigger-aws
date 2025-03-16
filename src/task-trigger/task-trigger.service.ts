import { Injectable } from '@nestjs/common'
import { TaskTriggerInputDto, TaskTriggerOutputDto } from './task-trigger.dto'
import { ParameterService } from '@shared'
import { BatchService } from '../../shared/src/batch/batch.service'
import { v4 as uuidv4 } from 'uuid'
import { ApiKeyNotFoundError, NoAuthorizedApiKeyError, GithubTokenNotFoundError, GithubRepoNameNotFoundError, GithubCommitShaNotFoundError, GithubAssigneeNotFoundError } from './task-trigger.error'
import { TaskRepository } from '../task/task.repository'
import { TaskStatus } from '../task/task.document'

@Injectable()
export class TaskTriggerService {
  constructor (private readonly parameterService: ParameterService, private readonly batchService: BatchService, private readonly taskRepository: TaskRepository) {}
  async process (input: TaskTriggerInputDto): Promise<TaskTriggerOutputDto> {
    const apiKey = await this.parameterService.get<string>('api-key')
    if (apiKey === undefined) {
      throw new ApiKeyNotFoundError('API key not found')
    }
    if (apiKey !== input.apiKey) {
      // FIXME: Use table for authorized API keys
      throw new NoAuthorizedApiKeyError('Invalid API key')
    }
    // FIXME: Use https://valibot.dev for validation
    if (input.githubToken === undefined) {
      throw new GithubTokenNotFoundError('Github token not found')
    }
    if (input.githubRepoName === undefined) {
      throw new GithubRepoNameNotFoundError('Github repo name not found')
    }
    if (input.githubCommitSha === undefined) {
      throw new GithubCommitShaNotFoundError('Github commit sha not found')
    }
    if (input.githubAssignee === undefined) {
      throw new GithubAssigneeNotFoundError('Github assignee not found')
    }
    const jobQueue = await this.parameterService.get<string>('github-security-scan-job-queue')
    const jobDefinition = await this.parameterService.get<string>('github-security-scan-job-definition')
    const anthropicApiKey = await this.parameterService.get<string>('anthropic-api-key')
    const taskId = `tvo-task-${uuidv4()}`
    await this.taskRepository.putItem({
      taskId,
      status: TaskStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + 3600
    })
    await this.batchService.submitJob(`github-security-scan-${taskId}`, jobQueue, jobDefinition, [
      { name: 'ANTHROPIC_API_KEY', value: anthropicApiKey },
      { name: 'GITHUB_TOKEN', value: input.githubToken },
      { name: 'GITHUB_REPO_NAME', value: input.githubRepoName },
      { name: 'GITHUB_COMMIT_SHA', value: input.githubCommitSha },
      { name: 'GITHUB_ASSIGNEE', value: input.githubAssignee },
      { name: 'TITVO_SCAN_TASK_ID', value: taskId }
    ])
    return {
      message: 'Task started',
      taskId
    }
  }
}
