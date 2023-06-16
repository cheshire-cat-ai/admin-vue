import type { PluginsState } from '@stores/types'
import type { Plugin } from '@models/Plugin'
import PluginService from '@services/PluginService'

export const usePlugins = defineStore('plugins', () => {
  const currentState = reactive<PluginsState>({
    loading: false,
    data: {
      installed: [],
      registry: []
    }
  })

  const { state: plugins, isLoading, error, execute: fetchPlugins } = useAsyncState(PluginService.getPlugins(), {
    installed: [],
    registry: []
  })

  watchEffect(() => {
    currentState.loading = isLoading.value
    currentState.data = plugins.value
    currentState.error = error.value as string
  })

  onActivated(() => fetchPlugins())

  const togglePlugin = async (id: Plugin['id']) => {
    if (currentState.data?.installed.find(p => p.id === id)) {
      await PluginService.togglePlugin(id)
      return true
    }
    return false
  }
  
  return {
    currentState,
    togglePlugin,
    fetchPlugins
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlugins, import.meta.hot))
}