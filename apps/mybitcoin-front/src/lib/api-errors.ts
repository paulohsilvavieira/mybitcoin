export class ApiError extends Error {
  status: number
  code: string
  details?: Record<string, string[]>

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/**
 * Mensagens por `code` de domínio — mais específico que o status HTTP.
 * Sem isso, qualquer 401 (incluindo INVALID_CREDENTIALS do próprio login,
 * onde nunca houve sessão) caía na mensagem genérica de "sessão expirada".
 */
const MESSAGE_BY_CODE: Record<string, string> = {
  INVALID_CREDENTIALS: 'E-mail ou senha inválidos.',
  ACCOUNT_SUSPENDED: 'Sua conta foi suspensa. Entre em contato com o suporte.',
  TOO_MANY_LOGIN_ATTEMPTS:
    'Muitas tentativas de login. Tente novamente em alguns minutos.',
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code in MESSAGE_BY_CODE) {
      return MESSAGE_BY_CODE[error.code]
    }

    switch (error.status) {
      case 400:
        return error.message || 'Dados inválidos.'
      case 401:
        return 'Sessão expirada. Faça login novamente.'
      case 403:
        return 'Sem permissão para esta operação.'
      case 404:
        return 'Recurso não encontrado.'
      case 409:
        return error.message || 'Conflito com dados existentes.'
      case 422:
        return error.message || 'Dados inválidos.'
      case 429:
        return 'Muitas requisições. Aguarde um momento.'
      case 500:
        return 'Erro interno. Tente novamente.'
      case 502:
      case 503:
        return 'Serviço indisponível. Tente novamente.'
      default:
        return error.message || 'Erro inesperado.'
    }
  }

  if (error instanceof Error) {
    if (error.name === 'CanceledError' || error.name === 'AbortError') {
      return 'Requisição cancelada.'
    }
    return 'Erro de conexão. Verifique sua internet.'
  }

  return 'Erro inesperado. Tente novamente.'
}

export function parseApiError(data: unknown): ApiError {
  if (data && typeof data === 'object' && 'statusCode' in data) {
    const obj = data as Record<string, unknown>
    return new ApiError(
      obj.statusCode as number,
      (obj.code as string) || 'UNKNOWN',
      (obj.message as string) || 'Erro desconhecido',
      obj.details as Record<string, string[]> | undefined,
    )
  }
  return new ApiError(500, 'UNKNOWN', 'Erro desconhecido')
}
