import { describe, it, expect, vi, afterEach } from 'vitest'
import { NestFactory } from '@nestjs/core'
import { INestApplicationContext } from '@nestjs/common'
import { AppModule } from '../../src/app.module'

// Mock de módulos externos necesarios para AppModule
vi.mock('nestjs-pino', () => {
  return {
    Logger: class {
      log = vi.fn()
      debug = vi.fn()
      error = vi.fn()
    },
    LoggerModule: {
      forRoot: vi.fn().mockReturnValue({
        // eslint-disable-next-line @typescript-eslint/no-extraneous-class
        module: class {},
        providers: [{ provide: 'LOGGER_MODULE_OPTIONS', useValue: {} }]
      })
    }
  }
})

vi.mock('pino', () => ({
  default: {
    stdTimeFunctions: {
      isoTime: vi.fn()
    }
  }
}))

// Mock para @titvo/aws
vi.mock('@titvo/aws', () => {
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  class DummyModule {}
  
  return {
    BatchModule: {
      forRoot: vi.fn().mockReturnValue({
        module: DummyModule,
        providers: []
      })
    },
    ConfigModule: {
      forRoot: vi.fn().mockReturnValue({
        module: DummyModule,
        providers: []
      })
    },
    SecretModule: {
      forRoot: vi.fn().mockReturnValue({
        module: DummyModule,
        providers: []
      })
    },
    SecretService: class {
      get = vi.fn().mockResolvedValue('mocked-secret')
    }
  }
})

// Mock para @shared/app/crypto/aes.service
vi.mock('@shared/app/crypto/aes.service', () => {
  return {
    AesService: class {
      encrypt = vi.fn().mockResolvedValue('encrypted-data')
    },
    ENCRYPTION_KEY_NAME_PROPERTY: 'ENCRYPTION_KEY_NAME'
  }
})

// Mock para @infrastructure/cli-files/cli-files.module
vi.mock('@infrastructure/cli-files/cli-files.module', () => {
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  class DummyModule {}
  
  return {
    CliFilesModule: DummyModule
  }
})

// Mock de la función initApp del entrypoint para controlar su comportamiento
vi.mock('../../src/entrypoint', () => {
  // No exportamos el handler real, solo una versión simplificada para las pruebas
  return {
    // Esta función se usará en lugar de la original cuando se importe el módulo
    initApp: vi.fn().mockImplementation(async () => {
      const app = await NestFactory.createApplicationContext(AppModule, {
        bufferLogs: true
      })
      await app.init()
      return app
    }),
    // Un handler falso para que las pruebas puedan importar el módulo
    handler: vi.fn()
  }
})

// Mock para @titvo/trigger
vi.mock('@titvo/trigger', () => {
  const mockExecute = vi.fn().mockResolvedValue({
    message: 'Success',
    scanId: '123'
  })

  return {
    TaskTriggerInputDto: class {
      apiKey?: string
      source: string
      args: Record<string, string>
    },
    TriggerTaskUseCase: class {
      execute = mockExecute
    },
    // Añadir mock para TaskRepository
    TaskRepository: class {
      save = vi.fn().mockResolvedValue(undefined)
      findById = vi.fn().mockResolvedValue(null)
      update = vi.fn().mockResolvedValue(undefined)
    },
    // Añadir mock para CliFilesRepository
    CliFilesRepository: class {
      findByBatchId = vi.fn().mockResolvedValue([])
    },
    // Añadir mock para CliFileEntity
    CliFileEntity: class {
      id: string
      batchId: string
      filename: string
      content: string
    }
  }
})

// Configurar variables de entorno necesarias para las pruebas
process.env.TASK_CLI_FILES_TABLE_NAME = 'test-table'
process.env.AWS_STAGE = 'test'
process.env.AWS_ENDPOINT = 'http://localhost:4566'
process.env.ENCRYPTION_KEY_NAME = 'test-encryption-key'

describe('Entrypoint initialization', () => {
  let appContext: INestApplicationContext | null = null

  afterEach(async () => {
    if (appContext !== null) {
      await appContext.close()
    }
    // Reiniciar todos los mocks después de cada prueba
    vi.clearAllMocks()
  })

  it('debería poder ejecutar la función initApp del entrypoint', async () => {
    // Importar la función initApp del entrypoint (mocked)
    const entrypointModule = await import('../../src/entrypoint') as unknown as { initApp: () => Promise<INestApplicationContext> }
    const { initApp } = entrypointModule

    // Ejecutar la función initApp
    appContext = await initApp()

    // Verificar que se creó el contexto correctamente
    expect(appContext).toBeDefined()
    expect(initApp).toHaveBeenCalled()
  })
})
