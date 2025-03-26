import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'

@Module({
  exports: [AuthService]
})
export class AuthModule {}
