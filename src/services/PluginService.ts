import { apiClient, tryRequest } from '@/api'
import type { PluginsList } from 'ccat-api'

/*
 * This is a service that is used to get the list of plugins active on the Cheshire Cat.
 * It can also toggle them according to the user's choice.
 */
const PluginService = Object.freeze({
  getPlugins: async () => {
    const result = await tryRequest(
      apiClient.value?.api?.plugins.listAvailablePlugins(), 
      "Getting all the available plugins", 
      "Unable to fetch the plugins"
    )
    return {
      results: result.data?.results,
      installed: result.data?.installed,
      registry: result.data?.registry
    } as Omit<PluginsList, 'status'>
  },
  togglePlugin: async (id: string) => {
    const result = await tryRequest(
      apiClient.value?.api?.plugins.togglePlugin(id), 
      `Toggle plugin ${id}`, 
      `Unable to toggle plugin ${id}`
    )
    return result.data
  },
  deletePlugin: async (id: string) => {
    const result = await tryRequest(
      apiClient.value?.api?.plugins.deletePlugin(id), 
      `Deleted plugin ${id}`, 
      `Unable to delete plugin ${id}`
    )
    return result.data
  },
  sendFile: async (file: File) => {
    const result = await tryRequest(
      apiClient.value?.api?.plugins.uploadPlugin({ file }), 
      "Uploaded plugin successfully", 
      "Unable to upload the plugin"
    )
    return result.data
  },
})

export default PluginService
