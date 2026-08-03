import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { apiClient, readCsrfToken } from '@/lib/api-client'
import { ApiError } from '@/lib/api-errors'

function setCookies(value: string) {
  Object.defineProperty(document, 'cookie', {
    value,
    writable: true,
    configurable: true,
  })
}

/** Adapter falso: técnica suportada pelo Axios para testar sem rede real. */
function mockAdapter(
  handler: (config: InternalAxiosRequestConfig) => {
    status: number
    data?: unknown
  },
): void {
  const adapter: AxiosAdapter = async (config) => {
    const result = handler(config)
    if (result.status >= 200 && result.status < 300) {
      return {
        data: result.data,
        status: result.status,
        statusText: '',
        headers: {},
        config,
      }
    }
    throw new AxiosError(
      `Request failed with status code ${result.status}`,
      AxiosError.ERR_BAD_REQUEST,
      config,
      undefined,
      {
        data: result.data,
        status: result.status,
        statusText: '',
        headers: {},
        config,
      },
    )
  }
  apiClient.defaults.adapter = adapter
}

describe('apiClient', () => {
  beforeEach(() => {
    setCookies('')
  })

  afterEach(() => {
    apiClient.defaults.adapter = undefined
  })

  it('envia withCredentials para que os cookies de sessão trafeguem', async () => {
    let captured: InternalAxiosRequestConfig | undefined
    mockAdapter((config) => {
      captured = config
      return { status: 200, data: { id: '1' } }
    })

    await apiClient.get('/auth/me')

    expect(captured?.withCredentials).toBe(true)
  })

  it('injeta X-CSRF-Token a partir do cookie __Host-csrf em requisições mutantes', async () => {
    setCookies('__Host-csrf=csrf-value-123')
    let captured: InternalAxiosRequestConfig | undefined
    mockAdapter((config) => {
      captured = config
      return { status: 204 }
    })

    await apiClient.post('/auth/logout')

    expect(captured?.headers.get('X-CSRF-Token')).toBe('csrf-value-123')
  })

  it('não injeta X-CSRF-Token em requisições GET', async () => {
    setCookies('__Host-csrf=csrf-value-123')
    let captured: InternalAxiosRequestConfig | undefined
    mockAdapter((config) => {
      captured = config
      return { status: 200, data: {} }
    })

    await apiClient.get('/auth/me')

    expect(captured?.headers.get('X-CSRF-Token')).toBeUndefined()
  })

  it('envia o body como JSON em POST', async () => {
    let captured: InternalAxiosRequestConfig | undefined
    mockAdapter((config) => {
      captured = config
      return { status: 200, data: {} }
    })

    await apiClient.post('/auth/login', {
      email: 'ada@example.com',
      password: 'secret',
    })

    expect(JSON.parse(captured?.data as string)).toEqual({
      email: 'ada@example.com',
      password: 'secret',
    })
    expect(captured?.headers.get('Content-Type')).toContain('application/json')
  })

  it('resolve com undefined em 204 sem corpo', async () => {
    mockAdapter(() => ({ status: 204 }))

    await expect(apiClient.post('/auth/logout')).resolves.toMatchObject({
      status: 204,
    })
  })

  it('lança ApiError com status e code da API em resposta de erro', async () => {
    mockAdapter(() => ({
      status: 401,
      data: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    }))

    const error = await apiClient
      .post('/auth/login', {})
      .catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(401)
    expect((error as ApiError).code).toBe('INVALID_CREDENTIALS')
  })

  it('lança ApiError mesmo quando a resposta de erro não tem corpo JSON', async () => {
    mockAdapter(() => ({ status: 500 }))

    const error = await apiClient.get('/auth/me').catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(500)
  })
})

describe('readCsrfToken', () => {
  it('retorna null quando o cookie CSRF não existe', () => {
    setCookies('outro=1')
    expect(readCsrfToken()).toBeNull()
  })

  it('lê o valor do cookie __Host-csrf entre outros cookies', () => {
    setCookies('a=1; __Host-csrf=token-abc; b=2')
    expect(readCsrfToken()).toBe('token-abc')
  })
})
