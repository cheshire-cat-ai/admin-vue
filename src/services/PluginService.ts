import LogService from '@services/LogService'
import { Plugins } from '@/api'

/*
 * This is a service that is used to get the list of plugins active on the Cheshire Cat.
 * It can also toggle them according to the user's choice.
 */
const PluginService = Object.freeze({
  getPlugins: async () => {
    const result = await Plugins.getAll()

    return result.data.plugins
  },
  togglePlugin: async (id: string) => {
    try {
      const result = await Plugins.toggle(id)

      LogService.print(`Toggle plugin ${id}`)

      if (result.status !== 200) throw new Error()

      return true
    } catch (error) {
      return false
    }
  }
})

export default PluginService
