import { Module } from '@nestjs/common'
import { TaskTriggerService } from './task-trigger.service'
import { createTaskRepository, TaskRepository } from '../task/task.repository'
import { ParameterService } from '@shared'
import { ScmModule } from '../scm/scm.module'
import { AuthService } from '../auth/auth.service'
import { createApiKeyRepository, ApiKeyRepository } from '../api-key/api-key.repository'
@Module({
  imports: [
    ScmModule
  ],
  providers: [
    TaskTriggerService,
    AuthService,
    {
      provide: ApiKeyRepository,
      useFactory: async (parameterService: ParameterService) => {
        const apiKeyTable = await parameterService.get('dynamo-api-key-table-name')
        return createApiKeyRepository({
          tableName: apiKeyTable as string,
          awsStage: process.env.AWS_STAGE ?? 'localstack',
          awsEndpoint: process.env.AWS_ENDPOINT ?? 'http://localhost:4566'
        })
      },
      inject: [ParameterService]
    },
    {
      provide: TaskRepository,
      useFactory: async (parameterService: ParameterService) => {
        const taskTable = await parameterService.get('dynamo-task-table-name')
        return createTaskRepository({
          tableName: taskTable as string,
          awsStage: process.env.AWS_STAGE ?? 'localstack',
          awsEndpoint: process.env.AWS_ENDPOINT ?? 'http://localhost:4566'
        })
      },
      inject: [ParameterService]
    }
  ]
})
export class TaskTriggerModule {}
