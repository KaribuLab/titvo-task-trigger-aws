import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { TaskCliFile } from './task-cli-files.dto'
export interface TaskCliFilesRepositoryOptions {
  tableName: string
  awsStage: string
  awsEndpoint: string
}

export class TaskCliFilesRepository {
  private readonly tableName: string

  constructor (
    private readonly dynamoDBClient: DynamoDBClient,
    tableName: string
  ) {
    this.tableName = tableName
  }

  async findByBatchId (batchId: string): Promise<TaskCliFile[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'batch_id = :batch_id',
      IndexName: 'batch_id_gsi',
      ExpressionAttributeValues: {
        ':batch_id': { S: batchId }
      }
    })
    const result = await this.dynamoDBClient.send(command)
    return result.Items?.map((item) => ({
      fileId: item.file_id.S as string,
      batchId: item.batch_id.S as string,
      fileKey: item.file_key.S as string,
      tti: parseInt(item.tti.N as string)
    })) ?? []
  }
}
export function createTaskCliFilesRepository (options: TaskCliFilesRepositoryOptions): TaskCliFilesRepository {
  const dynamoDBClient = options.awsStage === 'localstack'
    ? new DynamoDBClient({ endpoint: options.awsEndpoint })
    : new DynamoDBClient()

  return new TaskCliFilesRepository(dynamoDBClient, options.tableName)
}
