import type { JSONSettings } from '@models/JSONSchema'
import type { EmbedderConfigMetaData } from '@models/EmbedderConfig'
import EmbedderConfigService from '@services/EmbedderConfigService'
import { useNotifications } from '@stores/useNotifications'
import type { EmbedderConfigState } from '@stores/types'

export const useEmbedderConfig = defineStore('embedder', () => {
  const currentState = reactive<EmbedderConfigState>({
    loading: false,
    settings: {},
  })

  const { sendNotificationFromJSON } = useNotifications()

  const { state: embedders, isLoading, error } = useAsyncState(EmbedderConfigService.getEmbedders(), undefined)

  watchEffect(() => {
    currentState.loading = isLoading.value
    currentState.data = embedders.value
    currentState.error = error.value as string
    if (currentState.data) {
      currentState.selected = currentState.data.selected_configuration ?? Object.values(currentState.data.schemas)[0].languageEmbedderName
      currentState.settings = currentState.data.settings.reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {})
    }
  })
  
  const getAvailableEmbedders = () => {
    return embedders.value?.schemas ? Object.values(embedders.value.schemas) : []
  }

  const getEmbedderSchema = (selected = currentState.selected) => {
    if (!selected) return undefined
    return getAvailableEmbedders().find((schema) => schema.languageEmbedderName === selected)
  }

  const getEmbedderSettings = (selected = currentState.selected) => {
    if (!selected) return {} satisfies JSONSettings
    return currentState.settings[selected] ?? {} satisfies JSONSettings
  }

  const setEmbedderSettings = async (name: EmbedderConfigMetaData['languageEmbedderName'], settings: JSONSettings) => {
    try {
      const result = await EmbedderConfigService.setEmbedderSettings(name, settings)
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
    getAvailableEmbedders,
    getEmbedderSchema,
    getEmbedderSettings,
    setEmbedderSettings
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEmbedderConfig, import.meta.hot))
}