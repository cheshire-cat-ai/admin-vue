import MemoryService from '@services/MemoryService'
import { useNotifications } from '@stores/useNotifications'
import type { CollectionsState } from '@stores/types'

export const useMemory = defineStore('memory', () => {
  const currentState = reactive<CollectionsState>({
    loading: false,
    data: []
  })

  const { state: collections, isLoading, error, execute: fetchCollections } = useAsyncState(MemoryService.getCollections(), [])

  watchEffect(() => {
    currentState.loading = isLoading.value
    currentState.data = collections.value
    currentState.error = error.value ? `${error.value} available memories` : undefined
  })

  onActivated(() => fetchCollections())

  const { sendNotificationFromJSON } = useNotifications()

  const wipeAllCollections = async () => {
    const result = await MemoryService.wipeAllCollections()
    return sendNotificationFromJSON(result)
  }

  const wipeConversation = async () => {
    const result = await MemoryService.wipeConversation()
    return sendNotificationFromJSON(result)
  }

  const wipeCollection = async (collection: string) => {
    const result = await MemoryService.wipeCollection(collection)
    return sendNotificationFromJSON(result)
  }

  const callMemory = async (text: string, memories: number) => {
    const result = await MemoryService.callMemory(text, memories)
    return result
  }
  
  return {
    currentState,
    fetchCollections,
    wipeAllCollections,
    wipeConversation,
    wipeCollection,
    callMemory
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMemory, import.meta.hot))
}