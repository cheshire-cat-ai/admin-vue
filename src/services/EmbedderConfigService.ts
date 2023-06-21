import { get, put, tryRequest } from '@/api'
import type { EmbedderConfigDescriptor } from '@models/EmbedderConfig'
import type { JSONSettings } from '@models/JSONSchema'

/*
 * This is a service that is used to get/set the language model embedders settings.
 */
const EmbedderService = Object.freeze({
  getEmbedders: async () => {
    const result = await tryRequest(
      get<EmbedderConfigDescriptor>('/settings/embedder/'), 
      "Getting all the available embedders", 
      "Unable to get the list of available embedders"
    )
    return result.data
  },
  setEmbedderSettings: async (languageEmbedderName: string, settings: JSONSettings) => {
    return await tryRequest(
      put(`/settings/embedder/${languageEmbedderName}`, settings), 
      "Language model embedder updated successfully", 
      "Language model embedder couldn't be updated",
      "Sending the embedder settings to the cat"
    )
  }
})

export default EmbedderService