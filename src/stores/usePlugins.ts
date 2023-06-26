import type { PluginsState } from '@stores/types'
import type { Plugin } from 'ccat-api'
import { useNotifications } from '@stores/useNotifications'
import PluginService from '@services/PluginService'

export const usePlugins = defineStore('plugins', () => {
  const currentState = reactive<PluginsState>({
    loading: false,
    data: {
      results: 0,
      installed: [],
      registry: []
    }
  })

  const { state: plugins, isLoading, error, execute: fetchPlugins } = useAsyncState(PluginService.getPlugins(), {
    results: 0,
    installed: [],
    registry: []
  })

  const { showNotification } = useNotifications()

  watchEffect(() => {
    currentState.loading = isLoading.value
    currentState.data = plugins.value
    currentState.error = error.value as string
  })

  const togglePlugin = async (id: Plugin['id']) => {
    if (currentState.data?.installed.find(p => p.id === id)) {
      await PluginService.togglePlugin(id)
      return true
    }
    return false
  }

  const removePlugin = async (id: Plugin['id']) => {
    if (currentState.data?.installed.find(p => p.id === id)) {
      await PluginService.deletePlugin(id)
      fetchPlugins()
    }
    return false
  }

  const installPlugin = (file: File) => {
    currentState.loading = true
    PluginService.sendFile(file).then(() => {
      showNotification({
        text: `Plugin ${file.name} installed successfully!`,
        type: 'success'
      })
      fetchPlugins()
    }).catch(() => showNotification({
      text: `Unable to install the plugin ${file.name}.`,
      type: 'error'
    }))
  }
  
  return {
    currentState,
    togglePlugin,
    fetchPlugins,
    removePlugin,
    installPlugin
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlugins, import.meta.hot))
}