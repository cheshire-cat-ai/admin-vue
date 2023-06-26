import { apiClient, tryRequest } from '@/api'

/*
 * This is a service that is used to manage the memory of the Cheshire Cat.
 */
const MemoryService = Object.freeze({
  getCollections: async () => {
    const result = await tryRequest(
      apiClient.api.memory.getCollections(), 
      "Getting all the available collections", 
      "Unable to fetch available collections"
    )
    return result.data?.collections
  },
  wipeAllCollections: async () => {
    return await tryRequest(
      apiClient.api.memory.wipeCollections(), 
      "All in-memory collections were wiped", 
      "Unable to wipe the in-memory collections"
    )
  },
  wipeCollection: async (collectionId: string) => {
    return await tryRequest(
      apiClient.api.memory.wipeSingleCollection({ collectionId }), 
      `The ${collectionId} collection was wiped`, 
      `Unable to wipe the ${collectionId} collection`
    )
  },
  wipeConversation: async () => {
    return await tryRequest(
      apiClient.api.memory.wipeConversationHistory(), 
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
      apiClient.api.memory.recallMemoriesFromText(params), 
      `Recalling ${memories} memories with ${query} as query`, 
      "Unable to recall memory",
      ["Recalling memories from the cat with", params]
    )
    return result.data
  }
})

export default MemoryService
