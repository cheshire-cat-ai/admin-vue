import { uniqueId } from '@utils/commons'
import MemoryService from '@services/MemoryService'
import { useNotifications } from '@stores/useNotifications'

export const useMemory = defineStore('memory', () => {
  const { showNotification } = useNotifications()

  const wipeCollections = async () => {
    const result = await MemoryService.wipeCollections()
    showNotification({
      id: uniqueId(),
      type: result.status,
      text: result.message
    })
    return result.status != 'error'
  }

  const wipeConversation = async () => {
    const result = await MemoryService.wipeConversation()
    showNotification({
      id: uniqueId(),
      type: result.status,
      text: result.message
    })
    return result.status != 'error'
  }
  
  return {
    wipeCollections,
    wipeConversation
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMemory, import.meta.hot))
}