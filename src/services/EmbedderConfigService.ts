import { toJSON } from '@utils/commons'
import { config, authFetch } from '@/config'
import type { JSONSettings, JSONResponse } from '@models/JSONSchema'
import type { EmbedderConfigDescriptor } from '@models/EmbedderConfig'
import LogService from '@services/LogService'

/*
 * This is a service that is used to get/set the language model embedders settings.
 */
const Embedders = Object.freeze({
  getEmbedders: async () => {
    const endpoint = config.endpoints.allEmbedders

    return await authFetch(endpoint).then<EmbedderConfigDescriptor>(toJSON)
  },
  setEmbedderSettings: async (languageEmbedderName: string, settings?: JSONSettings) => {
    const endpoint = config.endpoints.allEmbedders.concat(languageEmbedderName)
    try {
      await authFetch(endpoint, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings ?? {})
      })

      LogService.print('Sending the embedder settings to the cat')

      return {
        status: 'success',
        message: "Language model embedder updated successfully"
      } as JSONResponse
    } catch (error) {
      return {
        status: 'error',
        message: "Language model embedder couldn't be updated"
      } as JSONResponse
    }
  }
})

export default Embedders