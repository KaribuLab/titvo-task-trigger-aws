import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ValidateApiKeyUseCase } from '@auth/app/api-key/api-key.service'
import { ApiKeyRepository } from '@auth/core/api-key/api-key.repository'
import { ApiKeyNotFoundError, NoAuthorizedApiKeyError } from '@auth/app/api-key/api-key.error'
import { ApiKeyEntity } from '@auth/core/api-key/api-key.entity'

// Mock del módulo crypto
vi.mock('crypto', () => ({
  createHash: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('mocked-hash')
  })
}))

describe('ValidateApiKeyUseCase', () => {
  let validateApiKeyUseCase: ValidateApiKeyUseCase
  let apiKeyRepository: ApiKeyRepository
  const mockApiKeyEntity: ApiKeyEntity = {
    keyId: 'key-123',
    userId: 'user-123',
    apiKey: 'api-key-123'
  }

  beforeEach(() => {
    // Crear mock para el repositorio
    apiKeyRepository = {
      findByApiKey: vi.fn().mockResolvedValue(mockApiKeyEntity)
    } as unknown as ApiKeyRepository

    // Crear la instancia del caso de uso
    validateApiKeyUseCase = new ValidateApiKeyUseCase(apiKeyRepository)
  })

  it('debería validar correctamente una API key', async () => {
    // Ejecutar el caso de uso
    const result = await validateApiKeyUseCase.execute('test-api-key')

    // Verificar que se buscó la API key hasheada en el repositorio
    expect(apiKeyRepository.findByApiKey).toHaveBeenCalledWith('mocked-hash')

    // Verificar que se devolvió la entidad de API key completa
    expect(result).toEqual(mockApiKeyEntity)
  })

  it('debería usar la API key directamente si ya es un hash SHA-256', async () => {
    // Mock para simular que la API key ya está hasheada (64 caracteres hexadecimales)
    const sha256ApiKey = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'

    // Ejecutar el caso de uso
    await validateApiKeyUseCase.execute(sha256ApiKey)

    // Verificar que se pasó la API key sin hashear
    expect(apiKeyRepository.findByApiKey).toHaveBeenCalledWith(sha256ApiKey)
  })

  it('debería lanzar ApiKeyNotFoundError si la API key es undefined', async () => {
    // Verificar que se lanza la excepción esperada
    await expect(validateApiKeyUseCase.execute(undefined)).rejects.toThrow(ApiKeyNotFoundError)
    expect(apiKeyRepository.findByApiKey).not.toHaveBeenCalled()
  })

  it('debería lanzar NoAuthorizedApiKeyError si la API key no se encuentra en el repositorio', async () => {
    // Mock para simular que no se encuentra la API key
    apiKeyRepository.findByApiKey = vi.fn().mockResolvedValue(null)

    // Verificar que se lanza la excepción esperada
    await expect(validateApiKeyUseCase.execute('invalid-api-key')).rejects.toThrow(NoAuthorizedApiKeyError)
    expect(apiKeyRepository.findByApiKey).toHaveBeenCalledWith('mocked-hash')
  })
})
