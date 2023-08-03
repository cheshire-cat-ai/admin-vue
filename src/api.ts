import { AxiosError } from "axios"
import type { JSONResponse } from "@models/JSONSchema"
import LogService from "@services/LogService"
import { CatClient, type CancelablePromise, ApiError } from 'ccat-api'

const { CORE_HOST, CORE_PORT, CORE_USE_SECURE_PROTOCOLS, API_KEY } = window.catCoreConfig

/**
 * API client to make requests to the endpoints and passing the API_KEY for authentication.
 */
export const apiClient = new CatClient({
  baseUrl: CORE_HOST,
  authKey: API_KEY,
  port: CORE_PORT ? parseInt(CORE_PORT) : undefined,
  secure: CORE_USE_SECURE_PROTOCOLS,
  timeout: 10000,
  ws: {
    path: 'ws',
    retries: 3,
    delay: 2500,
    onFailed: () => {
      console.error('Failed to connect WebSocket after 3 retries.')
    }
  }
})

/**
 * A function that wraps the promise request into a try/catch block
 * and check for errors to throw to the UI
 * @param request The axios promise function to await
 * @param success The message to return in case of success
 * @param error The message to return in case of error
 * @param log The log message/array of stuff to show
 * @returns A JSONResponse object containing status, message and optionally a data property
 */
export const tryRequest = async <T>(
  request: CancelablePromise<T> | undefined,
  success: string,
  error: string,
  log: unknown[] | string = success,
) => {
  try {
    if (request == undefined) throw new Error("Failed to reach the endpoint")

    const result = (await request) as T
    
    if (typeof log === 'string') LogService.print(log)
    else LogService.print(...log)

    return {
      status: 'success',
      message: success,
      data: result
    } as JSONResponse<T>
  } catch (err) {
    if (err instanceof AxiosError) {
      LogService.print(err.message)
      if (err.code === "ERR_NETWORK") error = "Network error while requesting"
    } else if (err instanceof ApiError) {
      LogService.print(err.body.detail)
      error = "Unable to authenticate request"
    }
    return {
      status: 'error',
      message: error
    } as JSONResponse<T>
  }
}