import { apiClient, tryRequest } from '@/api'
import type { JSONSettings } from '@models/JSONSchema'

/*
 * This is a service that is used to get/set the language model embedders settings.
 */
const EmbedderService = Object.freeze({
	getEmbedders: async () => {
		return await tryRequest(
			apiClient.api?.embedder.getEmbeddersSettings(),
			'Getting all the available embedders',
			'Unable to get the list of available embedders',
		)
	},
	setEmbedderSettings: async (languageEmbedderName: string, settings: JSONSettings) => {
		return await tryRequest(
			apiClient.api?.embedder.upsertEmbedderSetting(languageEmbedderName, settings),
			'Language model embedder updated successfully',
			"Language model embedder couldn't be updated",
			'Sending the embedder settings to the cat',
		)
	},
})

export default EmbedderService
