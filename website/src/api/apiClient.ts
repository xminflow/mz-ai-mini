import { API_SUCCESS_CODE, type ApiEnvelope } from '../types'
import { resolveApiBaseUrl, resolveRequestTimeoutMs } from './runtimeConfig'

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface RequestOptions {
  path: string
  method?: RequestMethod
  query?: Record<string, unknown>
  data?: unknown
  headers?: Record<string, string>
  timeoutMs?: number
  signal?: AbortSignal
}

export interface ApiClientErrorInit {
  code?: string
  statusCode?: number
  cause?: unknown
}

export class ApiClientError extends Error {
  readonly code: string
  readonly statusCode: number
  readonly cause?: unknown

  constructor(message: string, init: ApiClientErrorInit = {}) {
    super(message)
    this.name = 'ApiClientError'
    this.code = init.code ?? ''
    this.statusCode = init.statusCode ?? 0
    this.cause = init.cause
  }
}

const buildQueryString = (query: Record<string, unknown> | undefined): string => {
  if (!query) {
    return ''
  }
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue
    }
    const serialized = typeof value === 'string' ? value : String(value)
    if (serialized === '') {
      continue
    }
    params.append(key, serialized)
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

const buildUrl = (path: string, query: Record<string, unknown> | undefined): string =>
  `${resolveApiBaseUrl()}${path}${buildQueryString(query)}`

const mergeAbortSignals = (
  timeoutSignal: AbortSignal,
  externalSignal: AbortSignal | undefined,
): AbortSignal => {
  if (!externalSignal) {
    return timeoutSignal
  }
  const controller = new AbortController()
  const abortWith = (reason: unknown) => {
    if (!controller.signal.aborted) {
      controller.abort(reason)
    }
  }
  if (externalSignal.aborted) {
    abortWith(externalSignal.reason)
  } else {
    externalSignal.addEventListener('abort', () => abortWith(externalSignal.reason), { once: true })
  }
  if (timeoutSignal.aborted) {
    abortWith(timeoutSignal.reason)
  } else {
    timeoutSignal.addEventListener('abort', () => abortWith(timeoutSignal.reason), { once: true })
  }
  return controller.signal
}

export const request = async <T>(options: RequestOptions): Promise<T> => {
  const method = options.method ?? 'GET'
  const timeoutMs = options.timeoutMs ?? resolveRequestTimeoutMs()
  const url = buildUrl(options.path, options.query)
  const hasBody = options.data !== undefined && options.data !== null && method !== 'GET'

  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => timeoutController.abort(new Error('request timeout')), timeoutMs)
  const signal = mergeAbortSignals(timeoutController.signal, options.signal)

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers: {
        'content-type': 'application/json',
        ...(options.headers ?? {}),
      },
      body: hasBody ? JSON.stringify(options.data) : undefined,
      signal,
    })
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiClientError('Request aborted or timed out.', {
        code: 'NETWORK_ABORTED',
        cause: error,
      })
    }
    throw new ApiClientError('Network request failed.', {
      code: 'NETWORK_ERROR',
      cause: error,
    })
  } finally {
    clearTimeout(timeoutId)
  }

  let body: Partial<ApiEnvelope<T>> = {}
  try {
    body = (await response.json()) as Partial<ApiEnvelope<T>>
  } catch (error) {
    throw new ApiClientError('Failed to parse response body.', {
      code: 'INVALID_RESPONSE_BODY',
      statusCode: response.status,
      cause: error,
    })
  }

  if (!response.ok) {
    throw new ApiClientError(
      body.message ?? `Request failed with status ${response.status}.`,
      { code: body.code ?? '', statusCode: response.status },
    )
  }

  if (body.code !== API_SUCCESS_CODE) {
    throw new ApiClientError(
      body.message ?? 'Request failed with non-success code.',
      { code: body.code ?? '', statusCode: response.status },
    )
  }

  return body.data as T
}
