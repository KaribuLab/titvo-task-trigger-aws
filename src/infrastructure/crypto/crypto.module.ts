import { Module } from '@nestjs/common'
import { AesService } from '@shared/app/crypto/aes.service'

@Module({
  providers: [
    AesService
  ],
  exports: [AesService]
})
export class CryptoModule {}
