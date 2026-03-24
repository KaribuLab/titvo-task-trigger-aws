import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { TaskEntity, TaskRepository, TaskSource, TaskStatus } from '@titvo/trigger'

export interface TaskRepositoryOptions {
  tableName: string
  awsStage: string
  awsEndpoint: string
}

export class DynamoTaskRepository extends TaskRepository {
  private readonly tableName: string
  private readonly dynamoDBClient: DynamoDBDocumentClient

  constructor(dynamoDBClient: DynamoDBDocumentClient, tableName: string) {
    super()
    this.dynamoDBClient = dynamoDBClient
    this.tableName = tableName
  }

  async save(document: TaskEntity): Promise<void> {
    await this.dynamoDBClient.send(new PutCommand({
      TableName: this.tableName,
      Item: {
        scan_id: document.id as string,
        source: document.source,
        repository_id: document.repositoryId,
        status: document.status,
        created_at: document.createdAt,
        updated_at: document.updatedAt,
        args: document.args,
        job_id: document.jobId as string
      }
    }))
  }

  async getById(scanId: string): Promise<TaskEntity | null> {
    const result = await this.dynamoDBClient.send(new GetCommand({
      TableName: this.tableName,
      Key: { scan_id: scanId }
    }))
    if (result.Item === undefined) {
      return null
    }
    return {
      id: result.Item.scan_id,
      source: result.Item.source as TaskSource,
      repositoryId: result.Item.repository_id as string,
      jobId: result.Item.job_id as string,
      args: result.Item.args ? result.Item.args : {},
      result: result.Item.scan_result ? result.Item.scan_result : {},
      status: result.Item.status as TaskStatus,
      createdAt: result.Item.created_at as string,
      updatedAt: result.Item.updated_at as string
    }
  }
}

export function createTaskRepository(options: TaskRepositoryOptions): TaskRepository {
  const dynamoDBClient = options.awsStage === 'localstack' ? new DynamoDBClient({ endpoint: options.awsEndpoint }) : new DynamoDBClient()
  const dynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDBClient, {
    marshallOptions: {
      removeUndefinedValues: true
    },
  })
  return new DynamoTaskRepository(dynamoDBDocumentClient, options.tableName)
}
