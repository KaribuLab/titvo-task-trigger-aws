import { Module } from '@nestjs/common'
import { ParameterModule } from '@shared'
import { TaskTriggerModule } from './task-trigger/task-trigger.module'
import { BatchModule } from '../shared/src/batch/batch.module'
import { ScmModule } from './scm/scm.module'

@Module({
  imports: [
    ScmModule,
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
