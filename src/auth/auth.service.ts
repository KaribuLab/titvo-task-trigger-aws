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

    if (await this.parameterService.get<string>('api-key') !== apiKey) {
      throw new NoAuthorizedApiKeyError('API key is not authorized')
    }
  }
}
