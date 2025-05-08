import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { CliFileEntity, CliFilesRepository } from '@titvo/trigger'

export interface TaskCliFilesRepositoryOptions {
  tableName: string
  awsStage: string
  awsEndpoint: string
}

export class DynamoCliFilesRepository extends CliFilesRepository {
  private readonly tableName: string
  private readonly dynamoDBClient: DynamoDBClient

  constructor (
    dynamoDBClient: DynamoDBClient,
    tableName: string
  ) {
    super()
    this.dynamoDBClient = dynamoDBClient
    this.tableName = tableName
  }

  async findByBatchId (batchId: string): Promise<CliFileEntity[]> {
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
export function createDynamoCliFilesRepository (options: TaskCliFilesRepositoryOptions): CliFilesRepository {
  const dynamoDBClient = options.awsStage === 'localstack'
    ? new DynamoDBClient({ endpoint: options.awsEndpoint })
    : new DynamoDBClient()

  return new DynamoCliFilesRepository(dynamoDBClient, options.tableName)
}
