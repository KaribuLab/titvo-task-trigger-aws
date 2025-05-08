import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { TaskEntity, TaskRepository } from '@titvo/trigger'

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
}

export function createTaskRepository (options: TaskRepositoryOptions): TaskRepository {
  const dynamoDBClient = options.awsStage === 'localstack' ? new DynamoDBClient({ endpoint: options.awsEndpoint }) : new DynamoDBClient()
  return new DynamoTaskRepository(dynamoDBClient, options.tableName)
}
