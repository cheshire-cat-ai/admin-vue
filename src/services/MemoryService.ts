import { config, authFetch } from '@/config'
import LogService from '@services/LogService'
import type { JSONResponse } from '@models/JSONSchema'
import type { Memory } from '@models/Memory'
import { toJSON } from '@utils/commons'

/*
 * This is a service that is used to manage the memory of the Cheshire Cat.
 */
const MemoryService = Object.freeze({
  wipeAllCollections: async () => {
    const endpoint = config.endpoints.wipeAllCollections

    try {
      const result = await authFetch(endpoint, { method: 'DELETE' })

      LogService.print('Deleting all the in-memory collections')

      if (result.status !== 200) throw new Error()

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
  wipeCollection: async (collection: string) => {
    const endpoint = config.endpoints.wipeCollection

    try {
      const result = await authFetch(endpoint.concat(collection), { method: 'DELETE' })

      LogService.print(`Deleting the entire ${collection} collection`)

      if (result.status !== 200) throw new Error()

      return {
        status: 'success',
        message: `The ${collection} collection was wiped`
      } as JSONResponse
    } catch (error) {
      return {
        status: 'error',
        message: `Unable to wipe the ${collection} collection`
      } as JSONResponse
    }
  },
  wipeConversation: async () => {
    const endpoint = config.endpoints.wipeConversation

    try {
      const result = await authFetch(endpoint, { method: 'DELETE' })

      LogService.print('Deleting the in-memory current conversation')

      if (result.status !== 200) throw new Error()

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
  },
  callMemory: async (text: string, memories: number = 10) => {
    const endpoint = config.endpoints.callMemory

    return await authFetch(endpoint.concat('?') + new URLSearchParams({
      'text': text,
      'k': `${memories}`,
    }), { method: 'GET' }).then<Memory>(toJSON)
  }
})

export default MemoryService
