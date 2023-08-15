import { apiClient, tryRequest } from '@/api'
import type { JSONSettings } from '@models/JSONSchema'

/*
 * This is a service that is used to get/set the language models providers settings.
 */
const LLMService = Object.freeze({
	getProviders: async () => {
		return await tryRequest(
			apiClient.api?.largeLanguageModel.getLlmsSettings(),
			'Getting all the available providers',
			'Unable to get the list of available providers',
		)
	},
	setProviderSettings: async (languageModelName: string, settings: JSONSettings) => {
		return await tryRequest(
			apiClient.api?.largeLanguageModel.upsertLlmSetting(languageModelName, settings),
			'Language model provider updated successfully',
			"Language model provider couldn't be updated",
			'Sending the language model settings to the cat',
		)
	},
})

export default LLMService
