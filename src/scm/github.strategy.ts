import { Injectable } from '@nestjs/common'
import { TaskArgs, TaskSource } from '../task/task.domain'
import { ScmStrategy } from './scm.interface'
import { AesService } from '../crypto/aes.service'

export class GithubTokenNotFoundError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'GithubTokenNotFoundError'
  }
}

export class GithubRepoNameNotFoundError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'GithubRepoNameNotFoundError'
  }
}

export class GithubCommitShaNotFoundError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'GithubCommitShaNotFoundError'
  }
}

export class GithubAssigneeNotFoundError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'GithubAssigneeNotFoundError'
  }
}

@Injectable()
export class GithubStrategy implements ScmStrategy {
  constructor (protected readonly aesService: AesService) {}
  supports (taskSource: TaskSource): boolean {
    return taskSource === TaskSource.GITHUB
  }

  async handle (taskArgs: TaskArgs): Promise<TaskArgs> {
    const { github_assignee: githubAssignee, github_repo_name: githubRepoName, github_token: githubToken, github_commit_sha: githubCommitSha } = taskArgs
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
      repsitory_id: githubRepoName,
      github_assignee: githubAssignee,
      github_repo_name: githubRepoName,
      github_token: await this.aesService.encrypt(githubToken),
      github_commit_sha: githubCommitSha
    }
  }
}
