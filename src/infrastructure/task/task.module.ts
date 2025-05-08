import { Module } from '@nestjs/common'
import { createTaskRepository } from '@infrastructure/task/task.dynamo'
import { TaskRepository, TriggerTaskUseCase } from '@titvo/trigger'
import { ValidateApiKeyUseCase } from '@titvo/auth'
import { ApiKeyModule } from '@infrastructure/api-key/api-key.module'
import { CryptoModule } from '@infrastructure/crypto/crypto.module'
import { CliFilesModule } from '@infrastructure/cli-files/cli-files.module'
import { ScmModule } from '@infrastructure/scm/scm.module'
@Module({
  providers: [
    ValidateApiKeyUseCase,
    TriggerTaskUseCase,
    {
      provide: TaskRepository,
      useFactory: () => createTaskRepository({
        tableName: process.env.TASK_TABLE_NAME as string,
        awsStage: process.env.AWS_STAGE as string,
        awsEndpoint: process.env.AWS_ENDPOINT as string
      })
    }],
  imports: [ApiKeyModule, CryptoModule, CliFilesModule, ScmModule],
  exports: [TriggerTaskUseCase]
})
export class TaskModule {}
