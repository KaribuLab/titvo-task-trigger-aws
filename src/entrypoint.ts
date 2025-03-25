import { NestFactory } from '@nestjs/core'
import { Context, APIGatewayProxyHandlerV2, APIGatewayProxyCallbackV2, APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from 'aws-lambda'
import { TaskTriggerService } from './task-trigger/task-trigger.service'
import { AppModule } from './app.module'
import { HttpStatus, INestApplicationContext, Logger as NestLogger } from '@nestjs/common'

import { Logger } from 'nestjs-pino'
import { ParameterService } from '@shared'
import { TaskTriggerInputDto } from './task-trigger/task-trigger.dto'
import { ApiKeyNotFoundError, GithubTokenNotFoundError, GithubRepoNameNotFoundError, GithubCommitShaNotFoundError, GithubAssigneeNotFoundError, NoAuthorizedApiKeyError } from './task-trigger/task-trigger.error'
import { findHeaderCaseInsensitive } from './utils/headers'

const logger = new NestLogger('GetDebtLambdaHandler')

async function initApp (): Promise<INestApplicationContext> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true
  })
  await app.init()
  app.useLogger(app.get(Logger))
  app.flushLogs()
  return app
}

const app = await initApp()
app.get(ParameterService)
const taskTriggerService = app.get(TaskTriggerService)

export const handler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2, context: Context, callback: APIGatewayProxyCallbackV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const apiKey = findHeaderCaseInsensitive(event.headers, 'x-api-key')
    const body = JSON.parse(event.body ?? '{}')
    logger.log(`Received event: [source=${body.source as string}, args=${JSON.stringify(body.args)}]`)
    const input: TaskTriggerInputDto = {
      apiKey,
      source: body.source,
      args: body.args
    }
    const output = await taskTriggerService.process(input)
    return {
      headers: {
        'Content-Type': 'application/json'
      },
      statusCode: HttpStatus.OK,
      body: JSON.stringify({
        message: output.message,
        scan_id: output.scanId
      })
    }
  } catch (error) {
    logger.error('Error processing task trigger')
    logger.error(error)
    if (error instanceof ApiKeyNotFoundError) {
      return {
        headers: {
          'Content-Type': 'application/json'
        },
        statusCode: HttpStatus.UNAUTHORIZED,
        body: JSON.stringify({ message: error.message })
      }
    }
    if (error instanceof NoAuthorizedApiKeyError) {
      return {
        headers: {
          'Content-Type': 'application/json'
        },
        statusCode: HttpStatus.UNAUTHORIZED,
        body: JSON.stringify({ message: error.message })
      }
    }
    if (error instanceof GithubTokenNotFoundError) {
      return {
        headers: {
          'Content-Type': 'application/json'
        },
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({ message: error.message })
      }
    }
    if (error instanceof GithubRepoNameNotFoundError) {
      return {
        headers: {
          'Content-Type': 'application/json'
        },
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({ message: error.message })
      }
    }
    if (error instanceof GithubCommitShaNotFoundError) {
      return {
        headers: {
          'Content-Type': 'application/json'
        },
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({ message: error.message })
      }
    }
    if (error instanceof GithubAssigneeNotFoundError) {
      return {
        headers: {
          'Content-Type': 'application/json'
        },
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({ message: error.message })
      }
    }
    return {
      headers: {
        'Content-Type': 'application/json'
      },
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ message: 'Internal server error' })
    }
  }
}
