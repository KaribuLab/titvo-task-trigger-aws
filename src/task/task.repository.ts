import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { TaskDocument } from './task.document'

export interface TaskRepositoryOptions {
  tableName: string
  awsStage: string
  awsEndpoint: string
}

export class TaskRepository {
  constructor (private readonly dynamoDBClient: DynamoDBClient, private readonly tableName: string) {}

  async putItem (document: TaskDocument): Promise<void> {
    await this.dynamoDBClient.send(new PutItemCommand({
      TableName: this.tableName,
      Item: {
        task_id: { S: document.taskId },
        status: { S: document.status },
        created_at: { S: document.createdAt },
        updated_at: { S: document.updatedAt },
        ttl: { N: document.ttl.toString() }
      }
    }))
  }
}

export function createTaskRepository (options: TaskRepositoryOptions): TaskRepository {
  const dynamoDBClient = options.awsStage === 'localstack' ? new DynamoDBClient({ endpoint: options.awsEndpoint }) : new DynamoDBClient()
  return new TaskRepository(dynamoDBClient, options.tableName)
}
