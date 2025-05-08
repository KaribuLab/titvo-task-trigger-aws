import { Module } from '@nestjs/common'
import { createTaskRepository, DynamoTaskRepository } from '@infrastructure/task/task.dynamo'
import { TaskRepository, TriggerTaskUseCase } from '@titvo/trigger'
import { ValidateApiKeyUseCase } from '@titvo/auth'
import { ApiKeyModule } from '@infrastructure/api-key/api-key.module'

@Module({
  providers: [
    ValidateApiKeyUseCase,
    TriggerTaskUseCase,
    {
      provide: TaskRepository,
      useClass: DynamoTaskRepository,
      useFactory: () => createTaskRepository({
        tableName: process.env.TASK_TABLE_NAME as string,
        awsStage: process.env.AWS_STAGE as string,
        awsEndpoint: process.env.AWS_ENDPOINT as string
      })
    }],
  imports: [ApiKeyModule],
  exports: [TaskRepository]
})
export class TaskModule {}
