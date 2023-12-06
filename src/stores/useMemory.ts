import MemoryService from '@services/MemoryService'
import { useNotifications } from '@stores/useNotifications'
import type { CollectionsState } from '@stores/types'
import { remove } from 'lodash'
import { useSettings } from '@stores/useSettings'

export const useMemory = defineStore('memory', () => {
	const currentState = reactive<CollectionsState>({
		loading: false,
		data: [],
	})

	const { state: collections, isLoading, execute: fetchCollections } = useAsyncState(MemoryService.getCollections, undefined)

	const { isReadyAndAuth } = storeToRefs(useSettings())
	// TODO: Find a way to refresh calls without watching the boolean value (fix resetAllStores())
	watch(isReadyAndAuth, () => {
		fetchCollections()
	})

	watchEffect(() => {
		currentState.loading = isLoading.value
		currentState.data = collections.value?.data?.collections
		currentState.error = collections.value?.status === 'error' ? collections.value.message : undefined
	})

	onActivated(() => fetchCollections())

	const { sendNotificationFromJSON } = useNotifications()

	const wipeAllCollections = async () => {
		currentState.loading = true
		const result = await MemoryService.wipeAllCollections()
		currentState.loading = false
		if (result.status == 'success' && currentState.data) {
			remove(currentState.data, v => v.name != 'procedural')
			fetchCollections()
		}
		return sendNotificationFromJSON(result)
	}

	const wipeConversation = async () => {
		const result = await MemoryService.wipeConversation()
		return sendNotificationFromJSON(result)
	}

	const wipeCollection = async (collection: string) => {
		currentState.loading = true
		const result = await MemoryService.wipeCollection(collection)
		currentState.loading = false
		if (result.status == 'success' && currentState.data) {
			remove(currentState.data, v => v.name == collection)
			fetchCollections()
		}
		return sendNotificationFromJSON(result)
	}

	const callMemory = async (text: string, memories: number) => {
		const result = await MemoryService.callMemory(text, memories)
		return result
	}

	const deleteMemoryPoint = async (collection: string, memory: string) => {
		const result = await MemoryService.deleteMemoryPoint(collection, memory)
		return sendNotificationFromJSON(result)
	}

	return {
		currentState,
		fetchCollections,
		wipeAllCollections,
		wipeConversation,
		wipeCollection,
		callMemory,
		deleteMemoryPoint,
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useMemory, import.meta.hot))
}
