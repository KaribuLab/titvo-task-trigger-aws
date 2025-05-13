import { Module } from '@nestjs/common'
import { createTaskRepository } from '@infrastructure/task/task.dynamo'
import { TaskRepository, TriggerTaskUseCase } from '@titvo/trigger'
import { ApiKeyModule } from '@infrastructure/api-key/api-key.module'
import { CliFilesModule } from '@infrastructure/cli-files/cli-files.module'
import { ScmModule } from '@infrastructure/scm/scm.module'
@Module({
  providers: [
    TriggerTaskUseCase,
    {
      provide: TaskRepository,
      useFactory: () => createTaskRepository({
        tableName: process.env.TASK_TABLE_NAME as string,
        awsStage: process.env.AWS_STAGE as string,
        awsEndpoint: process.env.AWS_ENDPOINT as string
      })
    }],
  imports: [ApiKeyModule, CliFilesModule, ScmModule],
  exports: [TriggerTaskUseCase]
})
export class TaskModule {}
