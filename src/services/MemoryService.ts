import { apiClient, tryRequest } from '@/api'

/*
 * This is a service that is used to manage the memory of the Cheshire Cat.
 */
const MemoryService = Object.freeze({
	getCollections: async () => {
		return await tryRequest(
			apiClient.api?.memory.getCollections(),
			'Getting all the available collections',
			'Unable to fetch available collections',
		)
	},
	deleteMemoryPoint: async (collection: string, memory: string) => {
		return await tryRequest(
			apiClient.api?.memory.deletePointInMemory(collection, memory),
			'The selected memory point was wiped successfully',
			'Unable to wipe the memory point',
		)
	},
	wipeAllCollections: async () => {
		return await tryRequest(
			apiClient.api?.memory.wipeCollections(),
			'All in-memory collections were wiped',
			'Unable to wipe the in-memory collections',
		)
	},
	wipeCollection: async (collectionId: string) => {
		return await tryRequest(
			apiClient.api?.memory.wipeSingleCollection(collectionId),
			`The ${collectionId} collection was wiped`,
			`Unable to wipe the ${collectionId} collection`,
		)
	},
	wipeConversation: async () => {
		return await tryRequest(
			apiClient.api?.memory.wipeConversationHistory(),
			'The current conversation was wiped',
			'Unable to wipe the in-memory current conversation',
		)
	},
	getConversation: async () => {
		const result = await tryRequest(
			apiClient.api?.memory.getConversationHistory(),
			'Retrieved the conversation history',
			'Unable to retrieve the in-memory conversation history',
		)
		return result.data?.history ?? []
	},
	callMemory: async (query: string, memories = 10) => {
		const result = await tryRequest(
			apiClient.api?.memory.recallMemoriesFromText(query, memories),
			`Recalling ${memories} memories with ${query} as query`,
			'Unable to recall memory',
			`Recalling ${memories} memories from the cat with "${query}"`,
		)
		return result.data
	},
})

export default MemoryService
