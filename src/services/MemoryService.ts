import { get, destroy, tryRequest } from '@/api'
import type { Collection, Memory } from '@models/Memory'

/*
 * This is a service that is used to manage the memory of the Cheshire Cat.
 */
const MemoryService = Object.freeze({
  getCollections: async () => {
    const result = await tryRequest(
      get<{ collections: Collection[] }>('/memory/collections/'), 
      "Getting all the available collections", 
      "Unable to fetch available collections"
    )
    return result.data?.collections
  },
  wipeAllCollections: async () => {
    return await tryRequest(
      destroy('/memory/wipe-collections/'), 
      "All in-memory collections were wiped", 
      "Unable to wipe the in-memory collections"
    )
  },
  wipeCollection: async (collection: string) => {
    return await tryRequest(
      destroy(`/memory/collections/${collection}`), 
      `The ${collection} collection was wiped`, 
      `Unable to wipe the ${collection} collection`
    )
  },
  wipeConversation: async () => {
    return await tryRequest(
      destroy('/memory/working-memory/conversation-history/'), 
      "The current conversation was wiped", 
      "Unable to wipe the in-memory current conversation"
    )
  },
  callMemory: async (query: string, memories = 10) => {
    const params = { 
      text: query, 
      k: memories 
    }
    const result = await tryRequest(
      get<Memory>('/memory/recall/', { params }), 
      `Recalling ${memories} memories with ${query} as query`, 
      "Unable to recall memory",
      ["Recalling memories from the cat with", params]
    )
    return result.data
  }
})

export default MemoryService
