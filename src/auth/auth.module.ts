import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ParameterService } from '@shared'

@Module({
  providers: [AuthService, ParameterService],
  exports: [AuthService]
})
export class AuthModule {}
