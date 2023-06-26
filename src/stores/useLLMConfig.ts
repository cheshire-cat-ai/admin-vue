import type { SettingsConfigState } from '@stores/types'
import LLMConfigService from '@services/LLMConfigService'
import { useNotifications } from '@stores/useNotifications'
import type { JSONSettings } from '@models/JSONSchema'

export const useLLMConfig = defineStore('llm', () => {
  const currentState = reactive<SettingsConfigState>({
    loading: false,
    settings: {}
  })

  const { sendNotificationFromJSON } = useNotifications()

  const { state: providers, isLoading, error } = useAsyncState(LLMConfigService.getProviders(), undefined)

  watchEffect(() => {
    currentState.loading = isLoading.value
    currentState.data = providers.value
    currentState.error = error.value as string
    if (currentState.data) {
      currentState.selected = currentState.data.selected_configuration ?? Object.values(currentState.data.schemas)[0].title
      currentState.settings = currentState.data.settings.reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {})
    }
  })

  const getAvailableProviders = () => {
    return providers.value?.schemas ? Object.values(providers.value.schemas) : []
  }

  const getProviderSchema = (selected = currentState.selected) => {
    if (!selected) return undefined
    return getAvailableProviders().find((schema) => schema.title === selected)
  }

  const getProviderSettings = (selected = currentState.selected) => {
    if (!selected) return {} satisfies JSONSettings
    return currentState.settings[selected] ?? {} satisfies JSONSettings
  }

  const setProviderSettings = async (name: string, settings: JSONSettings) => {
    try {
      const result = await LLMConfigService.setProviderSettings(name, settings)
      sendNotificationFromJSON(result)
      if (result.status != 'error') {
        currentState.selected = name
        currentState.settings[name] = settings
      }
      return result.status != 'error'
    } catch (error) {
      sendNotificationFromJSON({
        status: 'error',
        message: error as string
      })
      return false
    }
  }

  return {
    currentState,
    setProviderSettings,
    getAvailableProviders,
    getProviderSchema,
    getProviderSettings
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLLMConfig, import.meta.hot))
}