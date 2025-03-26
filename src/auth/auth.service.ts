import { Injectable } from '@nestjs/common'
import { ApiKeyNotFoundError, NoAuthorizedApiKeyError } from './auth.error'
import { ParameterService } from '@shared'

@Injectable()
export class AuthService {
  constructor (private readonly parameterService: ParameterService) {}

  async validateApiKey (apiKey: string | undefined): Promise<void> {
    if (apiKey === undefined) {
      throw new ApiKeyNotFoundError('API key not found')
    }

    const authorizedApiKeys = await this.parameterService.get<string>('authorized-api-keys')
    if (authorizedApiKeys === undefined) {
      throw new NoAuthorizedApiKeyError('No authorized API keys configured')
    }

    const authorizedKeys = authorizedApiKeys.split(',')
    if (!authorizedKeys.includes(apiKey)) {
      throw new NoAuthorizedApiKeyError('API key is not authorized')
    }
  }
}
