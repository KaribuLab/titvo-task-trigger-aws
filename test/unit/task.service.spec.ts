import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TriggerTaskUseCase } from '@trigger/app/task/task.service'
import { BatchService } from '@titvo/aws'
import { ValidateApiKeyUseCase } from '@titvo/auth'
import { ScmStrategyResolver } from '@trigger/app/scm/scm.interface'
import { ConfigService } from '@titvo/shared'
import { TaskRepository } from '@trigger/core/task/task.repository'
import { RepositoryIdUndefinedException } from '@trigger/app/task/task.error'
import { TaskStatus } from '@trigger/core/task/task.entity'

// Mock del módulo uuid
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('mocked-uuid')
}))

// Mock del módulo crypto
vi.mock('crypto', () => ({
  createHash: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('mocked-hash')
  })
}))

describe('TriggerTaskUseCase', () => {
  let triggerTaskUseCase: TriggerTaskUseCase
  let configService: ConfigService
  let batchService: BatchService
  let taskRepository: TaskRepository
  let scmStrategyResolver: ScmStrategyResolver
  let validateApiKeyUseCase: ValidateApiKeyUseCase

  beforeEach(() => {
    // Crear mocks para todas las dependencias
    configService = {
      get: vi.fn().mockImplementation(async (key) => {
        if (key === 'security-scan-job-queue') return await Promise.resolve('job-queue')
        if (key === 'security-scan-job-definition') return await Promise.resolve('job-definition')
        return await Promise.resolve(null)
      })
    } as unknown as ConfigService

    batchService = {
      submitJob: vi.fn().mockResolvedValue(undefined)
    } as unknown as BatchService

    taskRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      getById: vi.fn().mockResolvedValue(null)
    } as unknown as TaskRepository

    const mockStrategy = {
      handle: vi.fn().mockImplementation(async (args) => {
        return {
          ...args,
          repository_slug: 'repository-slug'
        }
      })
    }

    scmStrategyResolver = {
      resolve: vi.fn().mockResolvedValue(mockStrategy)
    } as unknown as ScmStrategyResolver

    validateApiKeyUseCase = {
      execute: vi.fn().mockResolvedValue({ userId: 'user-123' })
    } as unknown as ValidateApiKeyUseCase

    // Crear la instancia del caso de uso
    triggerTaskUseCase = new TriggerTaskUseCase(
      configService,
      batchService,
      taskRepository,
      scmStrategyResolver,
      validateApiKeyUseCase
    )
  })

  it('debería ejecutar correctamente un trigger de tarea', async () => {
    // Preparar datos de prueba
    const input = {
      apiKey: 'test-api-key',
      source: 'bitbucket',
      args: {
        bitbucket_commit: 'abc123',
        bitbucket_workspace: 'workspace',
        bitbucket_repo_slug: 'repo',
        bitbucket_project_key: 'project'
      }
    }

    // Ejecutar el caso de uso
    const result = await triggerTaskUseCase.execute(input)

    // Verificar que las dependencias fueron llamadas correctamente
    expect(validateApiKeyUseCase.execute).toHaveBeenCalledWith('test-api-key')
    expect(scmStrategyResolver.resolve).toHaveBeenCalledWith('bitbucket')
    expect(configService.get).toHaveBeenCalledWith('security-scan-job-queue')
    expect(configService.get).toHaveBeenCalledWith('security-scan-job-definition')

    // Verificar que el repositorio guardó la tarea correctamente
    expect(taskRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      id: 'tvo-scan-mocked-uuid',
      source: 'bitbucket',
      repositoryId: 'user-123:mocked-hash',
      status: TaskStatus.PENDING,
      args: expect.objectContaining({
        bitbucket_commit: 'abc123',
        bitbucket_workspace: 'workspace',
        bitbucket_repo_slug: 'repo',
        bitbucket_project_key: 'project',
        repository_slug: 'repository-slug'
      })
    }))

    // Verificar que se envió el trabajo a AWS Batch
    expect(batchService.submitJob).toHaveBeenCalledWith(
      'bitbucket-security-scan-tvo-scan-mocked-uuid',
      'job-queue',
      'job-definition',
      [{ name: 'TITVO_SCAN_TASK_ID', value: 'tvo-scan-mocked-uuid' }]
    )

    // Verificar el resultado del caso de uso
    expect(result).toEqual({
      message: 'Scan starting',
      scanId: 'tvo-scan-mocked-uuid'
    })
  })

  it('debería lanzar RepositoryIdUndefinedException cuando repository_slug es undefined', async () => {
    // Modificar el mock de scmStrategyResolver.resolve para devolver un strategy que no incluye repository_slug
    const mockStrategyWithoutSlug = {
      handle: vi.fn().mockResolvedValue({
        bitbucket_commit: 'abc123'
        // Sin repository_slug
      })
    }
    scmStrategyResolver.resolve = vi.fn().mockResolvedValue(mockStrategyWithoutSlug)

    // Preparar datos de prueba
    const input = {
      apiKey: 'test-api-key',
      source: 'bitbucket',
      args: {
        bitbucket_commit: 'abc123'
      }
    }

    // Verificar que se lanza la excepción esperada
    await expect(triggerTaskUseCase.execute(input)).rejects.toThrow(RepositoryIdUndefinedException)
  })
})
