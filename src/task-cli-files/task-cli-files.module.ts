import { Module } from '@nestjs/common'
import { LoggerModule } from 'nestjs-pino'
import { pino } from 'pino'
import { createTaskCliFilesRepository, TaskCliFilesRepository } from './task-cli-files.repository'

const awsStage = process.env.AWS_STAGE ?? 'localstack'
const awsEndpoint = process.env.AWS_ENDPOINT ?? 'http://localhost:4566'

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
  providers: [
    {
      useFactory: () => {
        return createTaskCliFilesRepository({
          tableName: `tvo-security-scan-task-cli-files-${awsStage}`,
          awsEndpoint,
          awsStage
        })
      },
      provide: TaskCliFilesRepository
    }
  ]
})
export class TaskCliFilesModule {}
