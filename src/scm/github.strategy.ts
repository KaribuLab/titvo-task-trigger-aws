import { Injectable } from '@nestjs/common'
import { TaskArgs, TaskSource } from '../task/task.domain'
import { ScmStrategy } from './scm.interface'
import { AesService } from '../crypto/aes.service'
import { GithubTokenNotFoundError, GithubRepoNameNotFoundError, GithubCommitShaNotFoundError, GithubAssigneeNotFoundError } from '../task-trigger/task-trigger.error'

@Injectable()
export class GithubStrategy implements ScmStrategy {
  constructor (protected readonly aesService: AesService) {}
  supports (taskSource: TaskSource): boolean {
    return taskSource === TaskSource.GITHUB
  }

  async handle (taskArgs: TaskArgs): Promise<TaskArgs> {
    const { githubAssignee, githubRepoName, githubToken, githubCommitSha } = taskArgs
    if (githubToken === undefined) {
      throw new GithubTokenNotFoundError('Github token not found')
    }
    if (githubRepoName === undefined) {
      throw new GithubRepoNameNotFoundError('Github repo not found')
    }
    if (githubCommitSha === undefined) {
      throw new GithubCommitShaNotFoundError('Github commit sha not found')
    }
    if (githubAssignee === undefined) {
      throw new GithubAssigneeNotFoundError('Github assignee not found')
    }
    return {
      githubAssignee,
      githubRepoName,
      githubToken: await this.aesService.encrypt(githubToken),
      githubCommitSha
    }
  }
}
