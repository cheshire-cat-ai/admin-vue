import LogService from '@services/LogService'
import type { JSONResponse } from '@models/JSONSchema'
import { Memories } from '@/api'

/*
 * This is a service that is used to manage the memory of the Cheshire Cat.
 */
const MemoryService = Object.freeze({
  getCollections: async () => {
    try {
      const result = await Memories.getAll()

      if (result.status !== 200) throw new Error()

      return result.data.collections
    } catch (error) {
      return {
        status: 'error',
        message: `Unable to fetch available collections`
      } as JSONResponse
    }
  },
  wipeAllCollections: async () => {
    try {
      const result = await Memories.wipeCollections()

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
    try {
      const result = await Memories.wipeSingleCollection(collection)

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
    try {
      const result = await Memories.wipeCurrentConversation()

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
  callMemory: async (query: string, memories = 10) => {
    const params = { text: query, k: memories }
    try {
      const result = await Memories.recallMemory(params)

      LogService.print("Recalling memories from the cat with", params)

      if (result.status !== 200) throw new Error()

      return result.data
    } catch (error) {
      return {
        status: 'error',
        message: `Unable to recall memory`
      } as JSONResponse
    }
  }
})

export default MemoryService
