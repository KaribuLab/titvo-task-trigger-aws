import { Injectable } from '@nestjs/common'
import { TaskArgs, TaskSource } from '../task/task.domain'
import { ScmStrategy } from './scm.interface'
import { AesService } from '../crypto/aes.service'

export class BitbucketCommitShaNotFoundError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'BitbucketCommitShaNotFoundError'
  }
}

export class BitbucketWorkspaceNotFoundError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'BitbucketWorkspaceNotFoundError'
  }
}

export class BitbucketRepoSlugNotFoundError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'BitbucketRepoSlugNotFoundError'
  }
}

export class BitbucketProjectKeyNotFoundError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'BitbucketProjectKeyNotFoundError'
  }
}

@Injectable()
export class BitbucketStrategy implements ScmStrategy {
  constructor (protected readonly aesService: AesService) {}
  supports (taskSource: TaskSource): boolean {
    return taskSource === TaskSource.BITBUCKET
  }

  async handle (taskArgs: TaskArgs): Promise<TaskArgs> {
    const { bitbucket_commit: bitbucketCommit, bitbucket_workspace: bitbucketWorkspace, bitbucket_repo_slug: bitbucketRepoSlug, bitbucket_project_key: bitbucketProjectKey } = taskArgs

    if (bitbucketCommit === undefined) {
      throw new BitbucketCommitShaNotFoundError('Bitbucket commit sha not found')
    }

    if (bitbucketWorkspace === undefined) {
      throw new BitbucketWorkspaceNotFoundError('Bitbucket workspace not found')
    }
    if (bitbucketRepoSlug === undefined) {
      throw new BitbucketRepoSlugNotFoundError('Bitbucket repo slug not found')
    }
    if (bitbucketProjectKey === undefined) {
      throw new BitbucketProjectKeyNotFoundError('Bitbucket project key not found')
    }

    return {
      bitbucket_commit: bitbucketCommit,
      bitbucket_workspace: bitbucketWorkspace,
      bitbucket_repo_slug: bitbucketRepoSlug,
      bitbucket_project_key: bitbucketProjectKey
    }
  }
}
