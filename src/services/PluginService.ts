import type { Plugin } from '@models/Plugin'
import { config, authFetch } from '@/config'
import { toJSON } from '@utils/commons'

/*
 * This is a service that is used to get the list of plugins active on the Cheshire Cat.
 * It can also toggle them according to the user's choice.
 */
const PluginService = Object.freeze({
  getPlugins: async () => {
    const endpoint = config.endpoints.plugins

    return await authFetch(endpoint).then<{ plugins: Plugin[] }>(toJSON).then(({ plugins }) => plugins)
  },
  togglePlugin: async (id: string) => {
    //TODO: Enable/Disable the plugin
    console.log("Toggled", id)
  }
})

export default PluginService
