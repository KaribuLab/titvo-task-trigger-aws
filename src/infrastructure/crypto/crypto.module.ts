import { Module } from '@nestjs/common'
import { AesService, ENCRYPTION_KEY_NAME_PROPERTY } from '@shared/app/crypto/aes.service'

@Module({
  providers: [
    AesService,
    {
      provide: ENCRYPTION_KEY_NAME_PROPERTY,
      useValue: process.env.ENCRYPTION_KEY_NAME as string
    }
  ],
  exports: [AesService, ENCRYPTION_KEY_NAME_PROPERTY]
})
export class CryptoModule {}
