import { Module } from '@nestjs/common'
import { ParameterModule } from '@shared'
import { TaskTriggerModule } from './task-trigger/task-trigger.module'
import { BatchModule } from '../shared/src/batch/batch.module'
import pino from 'pino'
import { LoggerModule } from 'nestjs-pino'

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level (label: string): { level: string } {
            return { level: label }
          }
        }
      }
    }),
    TaskTriggerModule,
    ParameterModule.forRoot({
      parameterServiceOptions: {
        ttl: 60,
        awsEndpoint: process.env.AWS_ENDPOINT ?? 'http://localhost:4566',
        awsStage: process.env.AWS_STAGE ?? 'prod',
        parameterBasePath: '/tvo/security-scan',
        serviceName: 'task-trigger'
      },
      isGlobal: true
    }),
    BatchModule.forRoot({
      parameterServiceOptions: {
        awsEndpoint: process.env.AWS_ENDPOINT ?? 'http://localhost:4566',
        awsStage: process.env.AWS_STAGE ?? 'prod'
      },
      isGlobal: true
    })
  ]
})
export class AppModule {}
