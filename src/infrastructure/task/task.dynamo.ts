import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { TaskEntity, TaskRepository, TaskSource, TaskStatus } from '@titvo/trigger'

export interface TaskRepositoryOptions {
  tableName: string
  awsStage: string
  awsEndpoint: string
}

export class DynamoTaskRepository extends TaskRepository {
  private readonly tableName: string
  private readonly dynamoDBClient: DynamoDBClient

  constructor (dynamoDBClient: DynamoDBClient, tableName: string) {
    super()
    this.dynamoDBClient = dynamoDBClient
    this.tableName = tableName
  }

  async save (document: TaskEntity): Promise<void> {
    await this.dynamoDBClient.send(new PutItemCommand({
      TableName: this.tableName,
      Item: {
        scan_id: { S: document.id as string },
        source: { S: document.source },
        repository_id: { S: document.repositoryId },
        status: { S: document.status },
        created_at: { S: document.createdAt },
        updated_at: { S: document.updatedAt },
        args: {
          M: Object.fromEntries(Object.entries(document.args).map(([key, value]) => [key, { S: value }]))
        }
      }
    }))
  }

  async getById (scanId: string): Promise<TaskEntity | null> {
    const result = await this.dynamoDBClient.send(new GetItemCommand({
      TableName: this.tableName,
      Key: { scan_id: { S: scanId } }
    }))
    if (result.Item === undefined) {
      return null
    }
    return {
      id: result.Item.scan_id.S,
      source: result.Item.source.S as TaskSource,
      repositoryId: result.Item.repository_id.S as string,
      args: ((result.Item.args?.M) != null)
        ? Object.fromEntries(Object.entries(result.Item.args.M).map(([key, value]) => [key, value.S as string]))
        : {},
      result: ((result.Item.scan_result?.M) != null)
        ? Object.fromEntries(Object.entries(result.Item.scan_result.M).map(([key, value]) => [key, value.S as string]))
        : {},
      status: result.Item.status.S as TaskStatus,
      createdAt: result.Item.created_at.S as string,
      updatedAt: result.Item.updated_at.S as string
    }
  }
}

export function createTaskRepository (options: TaskRepositoryOptions): TaskRepository {
  const dynamoDBClient = options.awsStage === 'localstack' ? new DynamoDBClient({ endpoint: options.awsEndpoint }) : new DynamoDBClient()
  return new DynamoTaskRepository(dynamoDBClient, options.tableName)
}
