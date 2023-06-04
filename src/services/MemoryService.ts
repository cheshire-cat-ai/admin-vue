import { config, authFetch } from '@/config'
import LogService from '@services/LogService'
import type { JSONResponse } from '@models/JSONSchema'

/*
 * This is a service that is used to manage the memory of the Cheshire Cat.
 */
const MemoryService = Object.freeze({
  wipeCollections: async () => {
    const endpoint = config.endpoints.wipeCollections

    try {
      await authFetch(endpoint, { method: 'DELETE' })

      LogService.print('Deleting all the in-memory collections')

      return {
        status: 'success',
        message: "All in-memory collections were wiped"
      } as JSONResponse
    } catch (error) {
      return {
        status: 'error',
        message: "Unable to wipe the in-memory collections"
      } as JSONResponse
    }
  },
  wipeConversation: async () => {
    const endpoint = config.endpoints.wipeConversation

    try {
      await authFetch(endpoint, { method: 'DELETE' })

      LogService.print('Deleting the in-memory current conversation')

      return {
        status: 'success',
        message: "The current conversation was wiped"
      } as JSONResponse
    } catch (error) {
      return {
        status: 'error',
        message: "Unable to wipe the in-memory current conversation"
      } as JSONResponse
    }
  }
})

export default MemoryService
