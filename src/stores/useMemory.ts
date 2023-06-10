import { uniqueId } from '@utils/commons'
import { isJSONResponse } from '@utils/typeGuards'
import MemoryService from '@services/MemoryService'
import { useNotifications } from '@stores/useNotifications'
import type { JSONResponse } from '@models/JSONSchema'

export const useMemory = defineStore('memory', () => {
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
    if (isJSONResponse(result)) return result.message
    else return result
  }
  
  return {
    wipeAllCollections,
    wipeConversation,
    wipeCollection,
    callMemory
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMemory, import.meta.hot))
}