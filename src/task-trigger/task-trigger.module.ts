import { Module } from '@nestjs/common'
import { TaskTriggerService } from './task-trigger.service'
import { createTaskRepository, TaskRepository } from '../task/task.repository'
import { ScmModule } from '../scm/scm.module'
import { AuthService } from '../auth/auth.service'
import { createApiKeyRepository, ApiKeyRepository } from '../api-key/api-key.repository'

const awsStage = process.env.AWS_STAGE ?? 'localstack'
const awsEndpoint = process.env.AWS_ENDPOINT ?? 'http://localhost:4566'
@Module({
  imports: [
    ScmModule
  ],
  providers: [
    TaskTriggerService,
    AuthService,
    {
      provide: ApiKeyRepository,
      useFactory: () => {
        const apiKeyTable = `tvo-security-scan-account-apikey-${awsStage}`
        return createApiKeyRepository({
          tableName: apiKeyTable,
          awsStage,
          awsEndpoint
        })
      }
    },
    {
      provide: TaskRepository,
      useFactory: () => {
        const taskTable = `tvo-security-scan-task-task-${awsStage}`
        return createTaskRepository({
          tableName: taskTable,
          awsStage,
          awsEndpoint
        })
      }
    }
  ]
})
export class TaskTriggerModule {}
