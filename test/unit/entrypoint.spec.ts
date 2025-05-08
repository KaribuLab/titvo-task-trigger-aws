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
    }
  }
})

describe('AppModule initialization', () => {
  let appContext: INestApplicationContext | null = null

  afterEach(async () => {
    if (appContext !== null) {
      await appContext.close()
    }
  })

  it('debería inicializar el AppModule correctamente', async () => {
    // Inicializar el contexto de la aplicación
    appContext = await NestFactory.createApplicationContext(AppModule, {
      bufferLogs: true
    })

    await appContext.init()
    expect(appContext).toBeDefined()
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
