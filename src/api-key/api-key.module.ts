import { Module, DynamicModule, Provider, Type, ForwardReference } from '@nestjs/common'
import { ApiKeyRepository, ApiKeyRepositoryOptions, createApiKeyRepository } from './api-key.repository'

@Module({})
export class ApiKeyModule {
  static forRoot (options: ApiKeyRepositoryOptions): DynamicModule {
    const apiKeyRepositoryProvider: Provider = {
      provide: ApiKeyRepository,
      useFactory: () => {
        return createApiKeyRepository(options)
      }
    }

    return {
      module: ApiKeyModule,
      providers: [apiKeyRepositoryProvider],
      exports: [apiKeyRepositoryProvider],
      global: true
    }
  }

  static forRootAsync (options: {
    imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference<any>>
    useFactory: (...args: any[]) => ApiKeyRepositoryOptions | Promise<ApiKeyRepositoryOptions>
    inject?: any[]
  }): DynamicModule {
    const apiKeyRepositoryProvider: Provider = {
      provide: ApiKeyRepository,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args)
        return createApiKeyRepository(config)
      },
      inject: options.inject ?? []
    }

    const imports = options.imports ?? []

    return {
      module: ApiKeyModule,
      imports,
      providers: [apiKeyRepositoryProvider],
      exports: [apiKeyRepositoryProvider],
      global: true
    }
  }
}
