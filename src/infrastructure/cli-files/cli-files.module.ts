import { Module } from '@nestjs/common'
import { createDynamoTaskCliFilesRepository } from '@infrastructure/cli-files/cli-files.dynamo'
import { CliFilesRepository } from '@titvo/trigger'

@Module({
  providers: [{
    provide: CliFilesRepository,
    useFactory: () => {
      return createDynamoTaskCliFilesRepository(
        {
          tableName: process.env.TASK_CLI_FILES_TABLE_NAME as string,
          awsStage: process.env.AWS_STAGE as string,
          awsEndpoint: process.env.AWS_ENDPOINT as string
        }
      )
    }
  }],
  exports: [CliFilesRepository]
})
export class CliFilesModule {}
