import { NestFactory } from '@nestjs/core'
import { Context, APIGatewayProxyHandlerV2, APIGatewayProxyCallbackV2, APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from 'aws-lambda'
import { TaskTriggerService } from './task-trigger/task-trigger.service'
import { AppModule } from './app.module'
import { HttpStatus, INestApplicationContext, Logger as NestLogger } from '@nestjs/common'

import { Logger } from 'nestjs-pino'
import { ParameterService } from '@shared'
import { TaskTriggerInputDto } from './task-trigger/task-trigger.dto'
import { ApiKeyNotFoundError, GithubTokenNotFoundError, GithubRepoNameNotFoundError, GithubCommitShaNotFoundError, GithubAssigneeNotFoundError, NoAuthorizedApiKeyError } from './task-trigger/task-trigger.error'

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
  const headers = event.headers
  const body = JSON.parse(event.body as string)
  logger.log(`Received event: [repo_name='${body.github_repo_name as string}', commit_sha='${body.github_commit_sha as string}', assignee='${body.github_assignee as string}']`)
  const input: TaskTriggerInputDto = {
    apiKey: headers['x-api-key'],
    githubToken: body.github_token,
    githubRepoName: body.github_repo_name,
    githubCommitSha: body.github_commit_sha,
    githubAssignee: body.github_assignee
  }
  try {
    const output = await taskTriggerService.process(input)
    return {
      statusCode: HttpStatus.OK,
      body: JSON.stringify({
        message: output.message,
        task_id: output.taskId
      })
    }
  } catch (error) {
    logger.error('Error processing task trigger')
    logger.error(error)
    if (error instanceof ApiKeyNotFoundError) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        body: JSON.stringify({ message: error.message })
      }
    }
    if (error instanceof NoAuthorizedApiKeyError) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        body: JSON.stringify({ message: error.message })
      }
    }
    if (error instanceof GithubTokenNotFoundError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({ message: error.message })
      }
    }
    if (error instanceof GithubRepoNameNotFoundError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({ message: error.message })
      }
    }
    if (error instanceof GithubCommitShaNotFoundError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({ message: error.message })
      }
    }
    if (error instanceof GithubAssigneeNotFoundError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({ message: error.message })
      }
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ message: 'Internal server error' })
    }
  }
}
