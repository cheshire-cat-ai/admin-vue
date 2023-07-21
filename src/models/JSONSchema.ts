/**
 * Map the individual settings record for each provider or embedder
 */
export type JSONSettings<TSettings = unknown> = Record<string, TSettings>

/**
 * The structure of the generic JSON that arrives from the endpoints
 */
export interface JSONResponse<T> {
  readonly status: 'error' | 'success'
  readonly message: string
  readonly data?: T
}