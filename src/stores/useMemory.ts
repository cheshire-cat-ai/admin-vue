import MemoryService from '@services/MemoryService'
import { useMessages } from '@stores/useMessages'
import { useNotifications } from '@stores/useNotifications'
import type { CollectionsState } from '@stores/types'
import { remove } from 'lodash'

export const useMemory = defineStore('memory', () => {
  const currentState = reactive<CollectionsState>({
    loading: false,
    data: []
  })

  const { state: collections, isLoading, execute: fetchCollections } = useAsyncState(MemoryService.getCollections(), undefined)

  watchEffect(() => {
    currentState.loading = isLoading.value
    currentState.data = collections.value?.data?.collections
    currentState.error = collections.value?.status === 'error' ? collections.value.message : undefined
  })

  onActivated(() => fetchCollections())

  const { currentState: messagesState } = storeToRefs(useMessages())
  const { sendNotificationFromJSON } = useNotifications()

  const wipeAllCollections = async () => {
    const result = await MemoryService.wipeAllCollections()
    if (result.status == 'success') await fetchCollections()
    return sendNotificationFromJSON(result)
  }

  const wipeConversation = async () => {
    const result = await MemoryService.wipeConversation()
    if (result.status == 'success') messagesState.value.messages = []
    return sendNotificationFromJSON(result)
  }

  const wipeCollection = async (collection: string) => {
    const result = await MemoryService.wipeCollection(collection)
    if (result.status == 'success') remove(currentState.data ?? [], v => v.name == collection)
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
    deleteMemoryPoint
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMemory, import.meta.hot))
}