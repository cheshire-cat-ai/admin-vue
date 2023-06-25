import axios, { AxiosError, type AxiosResponse } from "axios"
import type { JSONResponse } from "@models/JSONSchema"
import config from "@/config"
import LogService from "@services/LogService"
import _ from "lodash"

/**
 * API client to make requests to the endpoints and passing the access_token for authentication.
 */
const apiClient = axios.create({
  baseURL: config.baseUrl,
  timeout: config.timeout,
  headers: { 
    'access_token': config.apiKey,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

export const { get, post, put, delete: destroy } = apiClient

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
  request: Promise<AxiosResponse<T, unknown>>,
  success: string,
  error: string,
  log: unknown[] | string = success,
) => {
  try {
    const result = await request
    
    if (result.status !== 200) throw new Error()
    
    if (typeof log === 'string') LogService.print(log)
    else LogService.print(...log)

    return {
      status: 'success',
      message: success,
      data: result.data
    } as JSONResponse<T>
  } catch (err) {
    if (err instanceof AxiosError) {
      error = _.capitalize(err.message)
      if (err.code === "ERR_NETWORK") throw "Network Error"
      else if (err.code !== "ECONNABORTED") throw "Failed to fetch"
    }
    return {
      status: 'error',
      message: error
    } as JSONResponse<T>
  }
}