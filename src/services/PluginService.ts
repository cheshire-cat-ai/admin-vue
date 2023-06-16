import LogService from '@services/LogService'
import { Plugins } from '@/api'
import type { JSONResponse } from '@models/JSONSchema'

/*
 * This is a service that is used to get the list of plugins active on the Cheshire Cat.
 * It can also toggle them according to the user's choice.
 */
const PluginService = Object.freeze({
  getPlugins: async () => {
    const result = await Plugins.getAll()

    return result.data
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
  },
  sendFile: async (file: File) => {
    try {
      const result = await Plugins.upload(file)

      LogService.print('Uploading a file to the cat')

      if (result.status !== 200) throw new Error()

      return {
        status: 'success',
        message: `Uploaded plugin successfully`
      } as JSONResponse
    } catch (error) {
      return {
        status: 'error',
        message: `Unable to upload the plugin`
      } as JSONResponse
    }
  },
})

export default PluginService
