import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ParameterService } from '@shared'
import { ApiKeyRepository, createApiKeyRepository } from '../api-key/api-key.repository'

@Module({
  providers: [
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
    }
  ],
  exports: [AuthService]
})
export class AuthModule {}
