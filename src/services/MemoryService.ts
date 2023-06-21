import { get, destroy, tryRequest } from '@/api'
import type { Collection, Memory } from '@models/Memory'

/*
 * This is a service that is used to manage the memory of the Cheshire Cat.
 */
const MemoryService = Object.freeze({
  getCollections: async () => {
    const result = await tryRequest(
      get<{ collections: Collection[] }>('/memory/collections/'), 
      "Getting all the available embedders", 
      "Unable to get the list of available embedders"
    )
    return result.data?.collections
  },
  wipeAllCollections: async () => {
    return await tryRequest(
      destroy('/memory/wipe-collections/'), 
      "Getting all the available embedders", 
      "Unable to get the list of available embedders"
    )
  },
  wipeCollection: async (collection: string) => {
    return await tryRequest(
      destroy(`/memory/collections/${collection}`), 
      "Getting all the available embedders", 
      "Unable to get the list of available embedders"
    )
  },
  wipeConversation: async () => {
    return await tryRequest(
      destroy('/memory/working-memory/conversation-history/'), 
      "Getting all the available embedders", 
      "Unable to get the list of available embedders"
    )
  },
  callMemory: async (query: string, memories = 10) => {
    const result = await tryRequest(
      get<Memory>('/memory/recall/', { params: { text: query, k: memories } }), 
      "Getting all the available embedders", 
      "Unable to get the list of available embedders"
    )
    return result.data
  }
})

export default MemoryService
