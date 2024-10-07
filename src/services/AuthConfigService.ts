import { apiClient, tryRequest } from '@services/ApiService'
import type { JSONSettings } from '@models/JSONSchema'

/*
 * This is a service that is used to get/set the auth handlers.
 */
const AuthService = Object.freeze({
	getHandlers: async () => {
		return await tryRequest(
			apiClient?.api?.authHandler.getAuthHandlerSettings(),
			'Getting all the available auth handlers',
			'Unable to get the list of available auth handlers',
		)
	},
	setHandlerSettings: async (handlerName: string, settings: JSONSettings) => {
		return await tryRequest(
			apiClient?.api?.authHandler.upsertAuthenticatorSetting(handlerName, settings),
			'Auth handler updated successfully',
			"Auth handler couldn't be updated",
			'Sending the auth handler settings to the cat',
		)
	},
})

export default AuthService
