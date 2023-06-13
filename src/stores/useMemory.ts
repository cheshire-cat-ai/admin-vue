import { uniqueId } from '@utils/commons'
import { isJSONResponse } from '@utils/typeGuards'
import MemoryService from '@services/MemoryService'
import { useNotifications } from '@stores/useNotifications'
import type { JSONResponse } from '@models/JSONSchema'
import type { CollectionsState } from '@stores/types'

export const useMemory = defineStore('memory', () => {
  const currentState = reactive<CollectionsState>({
    loading: false,
    data: []
  })

  const { state: collections, isLoading, error } = useAsyncState(MemoryService.getCollections(), [])

  watchEffect(() => {
    currentState.loading = isLoading.value
    currentState.data = isJSONResponse(collections.value) ? [] : collections.value
    currentState.error = isJSONResponse(collections.value) ? collections.value.message : error.value as string
  })

  const { showNotification } = useNotifications()

  const sendNotificationResult = (result: JSONResponse) => {
    showNotification({
      id: uniqueId(),
      type: result.status,
      text: result.message
    })
    return result.status != 'error'
  }

  const wipeAllCollections = async () => {
    const result = await MemoryService.wipeAllCollections()
    return sendNotificationResult(result)
  }

  const wipeConversation = async () => {
    const result = await MemoryService.wipeConversation()
    return sendNotificationResult(result)
  }

  const wipeCollection = async (collection: string) => {
    const result = await MemoryService.wipeCollection(collection)
    return sendNotificationResult(result)
  }

  const callMemory = async (text: string, memories: number) => {
    const result = await MemoryService.callMemory(text, memories)
    if (isJSONResponse(result)) {
      currentState.error = result.message
      return null
    } else return result
  }
  
  return {
    currentState,
    wipeAllCollections,
    wipeConversation,
    wipeCollection,
    callMemory
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMemory, import.meta.hot))
}