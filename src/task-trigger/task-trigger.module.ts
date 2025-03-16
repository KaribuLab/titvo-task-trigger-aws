import { Module } from '@nestjs/common'
import { TaskTriggerService } from './task-trigger.service'
import { LoggerModule } from 'nestjs-pino'
import pino from 'pino'

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
    })
  ],
  providers: [TaskTriggerService]
})
export class TaskTriggerModule {}
