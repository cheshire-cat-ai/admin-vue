import type { JSONSettings } from '@models/JSONSchema'
import EmbedderConfigService from '@services/EmbedderConfigService'
import { useNotifications } from '@stores/useNotifications'
import type { SettingsConfigState } from '@stores/types'

export const useEmbedderConfig = defineStore('embedder', () => {
  const currentState = reactive<SettingsConfigState>({
    loading: false,
    settings: {},
  })

  const { sendNotificationFromJSON } = useNotifications()

  const { state: embedders, isLoading } = useAsyncState(EmbedderConfigService.getEmbedders(), undefined)

  watchEffect(() => {
    currentState.loading = isLoading.value
    currentState.data = embedders.value?.data
    currentState.error = embedders.value?.status === 'error' ? embedders.value.message : undefined
    if (currentState.data) {
      currentState.selected = currentState.data.selected_configuration ?? Object.values(currentState.data.schemas)[0].title
      currentState.settings = currentState.data.settings.reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {})
    }
  })
  
  const getAvailableEmbedders = () => {
    return embedders.value?.data?.schemas ? Object.values(embedders.value.data.schemas) : []
  }

  const getEmbedderSchema = (selected = currentState.selected) => {
    if (!selected) return undefined
    return getAvailableEmbedders().find((schema) => schema.title === selected)
  }

  const getEmbedderSettings = (selected = currentState.selected) => {
    if (!selected) return {} satisfies JSONSettings
    return currentState.settings[selected] ?? {} satisfies JSONSettings
  }

  const setEmbedderSettings = async (name: string, settings: JSONSettings) => {
    const result = await EmbedderConfigService.setEmbedderSettings(name, settings)
    sendNotificationFromJSON(result)
    if (result.status != 'error') {
      currentState.selected = name
      currentState.settings[name] = settings
    }
    return result.status != 'error'
  }

  return {
    currentState,
    getAvailableEmbedders,
    getEmbedderSchema,
    getEmbedderSettings,
    setEmbedderSettings
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEmbedderConfig, import.meta.hot))
}