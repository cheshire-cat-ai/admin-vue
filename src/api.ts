import type { JSONResponse } from '@models/JSONSchema'
import LogService from '@services/LogService'
import { CatClient, type CancelablePromise, type AuthPermission, type AuthResource } from 'ccat-api'
import type { PureAbility as Ability } from '@casl/ability'

const { DEV } = import.meta.env

const getPort = () => {
	if (DEV) return 1865
	if (window.location.port == '443' || window.location.port == '80') return undefined
	return parseInt(window.location.port)
}

/**
 * API client to make requests to the endpoints and passing the API_KEY for authentication.
 */
export const apiClient = new CatClient({
	baseUrl: window.location.hostname,
	port: getPort(),
	secure: window.location.protocol === 'https:',
	timeout: 15000,
	instant: false,
	ws: {
		retries: 3,
		delay: 3000,
		onFailed: () => {
			console.error('Failed to connect WebSocket after 3 retries.')
		},
	},
})

export const updateCredential = (cred: string | undefined) => (apiClient.credential = cred)

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
		if (request == undefined) throw new Error('Failed to reach the endpoint')

		const result = (await request) as T

		if (typeof log === 'string') LogService.success(log)
		else LogService.success(...log)

		return {
			status: 'success',
			message: success,
			data: result,
		} as JSONResponse<T>
	} catch (err) {
		const msg = getErrorMessage(err, error)

		LogService.error(msg)

		return {
			status: 'error',
			message: msg,
		} as JSONResponse<T>
	}
}

export type AppAbility = Ability<[AuthPermission, AuthResource]>

// TODO: Fix why this is not working
declare module 'vue' {
	export interface ComponentCustomProperties {
		$ability: AppAbility
		$can(this: this, ...args: Parameters<this['$ability']['can']>): boolean
	}
}
