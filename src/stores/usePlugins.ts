import type { PluginsState } from '@stores/types'
import type { Plugin } from 'ccat-api'
import { useNotifications } from '@stores/useNotifications'
import PluginService from '@services/PluginService'
import type { JSONSettings } from '@models/JSONSchema'

export const usePlugins = defineStore('plugins', () => {
  const currentState = reactive<PluginsState>({
    loading: false,
    data: {
      results: 0,
      installed: [],
      registry: []
    }
  })

  const { state: plugins, isLoading, execute: fetchPlugins } = useAsyncState(PluginService.getPlugins(), undefined)
  const { state: settings, execute: fetchSettings } = useAsyncState(PluginService.getPluginsSettings(), undefined)

  const { showNotification } = useNotifications()

  watchEffect(() => {
    currentState.loading = isLoading.value
    currentState.data = plugins.value?.data
    currentState.error = plugins.value?.status === 'error' ? plugins.value.message : undefined
  })

  const isInstalled = (id: Plugin['id']) => currentState.data?.installed.find(p => p.id === id)

  const getSchema = (id: Plugin['id']) => settings.value?.data?.schemas[id]

  const getSettings = (id: Plugin['id']) => settings.value?.data?.settings.find(p => p.id === id)

  const togglePlugin = async (id: Plugin['id'], name: Plugin['name'], active: boolean) => {
    if (isInstalled(id)) {
      showNotification({
        text: `Plugin ${name} is being switched ${active ? 'off' : 'on'}!`,
        type: active ? 'error' : 'success'
      })
      await PluginService.togglePlugin(id)
      fetchPlugins()
      return true
    }
    return false
  }

  const updateSettings = async (id: Plugin['id'] | undefined, settings: JSONSettings) => {
    if (!id) return
    if (isInstalled(id)) await PluginService.updateSettings(id, settings)
  }

  const removePlugin = async (id: Plugin['id']) => {
    if (currentState.data?.installed.find(p => p.id === id)) {
      await PluginService.deletePlugin(id)
      fetchPlugins()
      return true
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
    installPlugin,
    isInstalled,
    updateSettings,
    getSchema,
    getSettings,
    fetchSettings,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlugins, import.meta.hot))
}