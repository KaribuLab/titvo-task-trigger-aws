import { Module } from '@nestjs/common'
import { DynamoTaskCliFilesRepository, createDynamoTaskCliFilesRepository } from '@infrastructure/cli-files/cli-files.dynamo'
import { CliFilesRepository } from '@titvo/trigger'

@Module({
  providers: [{
    provide: CliFilesRepository,
    useClass: DynamoTaskCliFilesRepository,
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
  exports: [DynamoTaskCliFilesRepository]
})
export class CliFilesModule {}
