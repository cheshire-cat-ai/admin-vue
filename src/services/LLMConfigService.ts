import { get, put, tryRequest } from '@/api'
import type { LLMConfigDescriptor } from '@models/LLMConfig'
import type { JSONSettings } from '@models/JSONSchema'

/*
 * This is a service that is used to get/set the language models providers settings.
 */
const LLMService = Object.freeze({
  getProviders: async () => {
    const result = await tryRequest(
      get<LLMConfigDescriptor>('/settings/llm/'), 
      "Getting all the available providers", 
      "Unable to get the list of available providers"
    )
    return result.data
  },
  setProviderSettings: async (languageModelName: string, settings: JSONSettings) => {
    return await tryRequest(
      put(`/settings/llm/${languageModelName}`, settings), 
      "Language model provider updated successfully", 
      "Language model provider couldn't be updated",
      "Sending the language model settings to the cat"
    )
  }
})

export default LLMService
