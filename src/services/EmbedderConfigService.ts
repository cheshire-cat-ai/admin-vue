import { Embedders } from '@/api'
import type { JSONSettings, JSONResponse } from '@models/JSONSchema'
import LogService from '@services/LogService'

/*
 * This is a service that is used to get/set the language model embedders settings.
 */
const EmbedderService = Object.freeze({
  getEmbedders: async () => {
    const result = await Embedders.getAll()
    return result.data
  },
  setEmbedderSettings: async (languageEmbedderName: string, settings: JSONSettings) => {
    try {
      const result = await Embedders.updateSettings(languageEmbedderName, settings)

      LogService.print('Sending the embedder settings to the cat')

      if (result.status !== 200) throw new Error()

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

export default EmbedderService