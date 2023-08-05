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

  const { state: providers, isLoading } = useAsyncState(LLMConfigService.getProviders(), undefined)

  const getAvailableProviders = computed(() => {
    const schemas = providers.value?.data?.schemas ? Object.values(providers.value.data.schemas) : []
    if (schemas.length === 0) currentState.error = 'No large language models found'
    return schemas
  })

  watchEffect(() => {
    currentState.loading = isLoading.value
    currentState.data = providers.value?.data
    currentState.error = providers.value?.status === 'error' ? providers.value.message : undefined
    
    if (currentState.data) {
      currentState.selected = currentState.data.selected_configuration ?? Object.values(currentState.data.schemas)[0].title
      currentState.settings = currentState.data.settings.reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {})
    }
  })

  const getProviderSchema = (selected = currentState.selected) => {
    if (!selected) return undefined
    return getAvailableProviders.value.find((schema) => schema.title === selected)
  }

  const getProviderSettings = (selected = currentState.selected) => {
    if (!selected) return {} satisfies JSONSettings
    return currentState.settings[selected] ?? {} satisfies JSONSettings
  }

  const setProviderSettings = async (name: string, settings: JSONSettings) => {
    const result = await LLMConfigService.setProviderSettings(name, settings)
    sendNotificationFromJSON(result)
    if (result.status != 'error') {
      currentState.selected = name
      currentState.settings[name] = settings
    }
    return result.status != 'error'
  }

  return {
    currentState,
    getAvailableProviders,
    setProviderSettings,
    getProviderSchema,
    getProviderSettings
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLLMConfig, import.meta.hot))
}