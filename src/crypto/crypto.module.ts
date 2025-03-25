import { Module } from '@nestjs/common'
import { createSecretManagerService, SecretManagerService } from './secret.service'
import { AesService } from './aes.service'

@Module({
  providers: [
    {
      provide: SecretManagerService,
      useFactory: () => {
        return createSecretManagerService({
          basePath: process.env.SECRET_MANAGER_BASE_PATH ?? '/tvo/security-scan',
          awsStage: process.env.AWS_STAGE ?? 'prod',
          awsEndpoint: process.env.AWS_ENDPOINT ?? 'http://localhost:4566'
        })
      }
    },
    AesService
  ],
  exports: [SecretManagerService, AesService]
})
export class CryptoModule {}
