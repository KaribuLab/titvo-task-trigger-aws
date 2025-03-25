import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

interface SecretManagerOptions {
  basePath: string
  awsStage: string
  awsEndpoint: string
}

export class SecretManagerService {
  constructor (private readonly secretManagerClient: SecretsManagerClient, private readonly basePath: string) {}

  async get (name: string): Promise<string | undefined> {
    const command = new GetSecretValueCommand({ SecretId: `${this.basePath}/${name}` })
    const response = await this.secretManagerClient.send(command)
    return response.SecretString
  }
}

export function createSecretManagerService (options: SecretManagerOptions): SecretManagerService {
  const secretsManagerClient = options.awsStage === 'localstack' ? new SecretsManagerClient({ endpoint: options.awsEndpoint }) : new SecretsManagerClient()
  return new SecretManagerService(secretsManagerClient, `${options.basePath}/${options.awsStage}`)
}
