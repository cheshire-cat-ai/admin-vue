import { LanguageModels } from '@/api'
import type { JSONSettings, JSONResponse } from '@models/JSONSchema'
import LogService from '@services/LogService'

/*
 * This is a service that is used to get/set the language models providers settings.
 */
const LLMService = Object.freeze({
  getProviders: async () => {
    const result = await LanguageModels.getAll()
    return result.data
  },
  setProviderSettings: async (languageModelName: string, settings: JSONSettings) => {
    try {
      const result = await LanguageModels.updateSettings(languageModelName, settings)

      LogService.print('Sending the language model settings to the cat')

      if (result.status !== 200) throw new Error()

      return {
        status: 'success',
        message: "Language model provider updated successfully"
      } as JSONResponse
    } catch (error) {
      return {
        status: 'error',
        message: "Language model provider couldn't be updated"
      } as JSONResponse
    }
  }
})

export default LLMService
