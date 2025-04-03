import { Module } from '@nestjs/common'
import { createTaskCliFilesRepository, TaskCliFilesRepository } from './task-cli-files.repository'

const awsStage = process.env.AWS_STAGE ?? 'localstack'
const awsEndpoint = process.env.AWS_ENDPOINT ?? 'http://localhost:4566'

@Module({
  providers: [
    {
      useFactory: () => {
        return createTaskCliFilesRepository({
          tableName: `tvo-security-scan-task-cli-files-${awsStage}`,
          awsEndpoint,
          awsStage
        })
      },
      provide: TaskCliFilesRepository
    }
  ],
  exports: [TaskCliFilesRepository]
})
export class TaskCliFilesModule {}
