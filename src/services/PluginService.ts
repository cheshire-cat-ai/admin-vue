import { post, put, get, tryRequest } from '@/api'
import type { PluginsResponse } from '@models/Plugin'

/*
 * This is a service that is used to get the list of plugins active on the Cheshire Cat.
 * It can also toggle them according to the user's choice.
 */
const PluginService = Object.freeze({
  getPlugins: async () => {
    const result = await tryRequest(
      get<PluginsResponse>('/plugins/'), 
      "Getting all the available plugins", 
      "Unable to fetch the plugins"
    )
    return result.data
  },
  togglePlugin: async (id: string) => {
    const result = await tryRequest<boolean>(
      put(`/plugins/toggle/${id}`), 
      `Toggle plugin ${id}`, 
      `Unable to toggle plugin ${id}`
    )
    return result.data ?? false
  },
  sendFile: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return await tryRequest(
      post('/plugins/install/', formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }), 
      "Uploaded plugin successfully", 
      "Unable to upload the plugin"
    )
  },
})

export default PluginService
