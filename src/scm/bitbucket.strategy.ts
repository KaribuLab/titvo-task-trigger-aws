import { Injectable } from '@nestjs/common'
import { TaskArgs, TaskSource } from '../task/task.domain'
import { ScmStrategy } from './scm.interface'
import { AesService } from '../crypto/aes.service'

@Injectable()
export class BitbucketStrategy implements ScmStrategy {
  constructor (protected readonly aesService: AesService) {}
  supports (taskSource: TaskSource): boolean {
    return taskSource === TaskSource.BITBUCKET
  }

  async handle (taskArgs: TaskArgs): Promise<TaskArgs> {
    throw new Error('Not implemented')
  }
}
