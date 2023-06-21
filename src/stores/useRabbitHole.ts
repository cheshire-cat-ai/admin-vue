import type { FileUploaderState } from '@stores/types'
import { getErrorMessage } from '@utils/errors'
import { useNotifications } from '@stores/useNotifications'
import RabbitHoleService from '@services/RabbitHoleService'

export const useRabbitHole = defineStore('rabbitHole', () => {
  const currentState = reactive<FileUploaderState>({
    loading: false,
    data: undefined
  })

  const { showNotification } = useNotifications()

  const sendFile = (file: File) => {
    currentState.loading = true
    RabbitHoleService.sendFile(file).then((data) => {
      currentState.loading = false
      currentState.data = data
    }).then(() => showNotification({
      text: `File ${file.name} successfully sent down the rabbit hole!`,
      type: 'success'
    })).catch((error) => {
      currentState.error = getErrorMessage(error)
    })
  }

  const sendMemory = (file: File) => {
    currentState.loading = true
    RabbitHoleService.sendMemory(file).then((data) => {
      currentState.loading = false
      currentState.data = data
    }).then(() => showNotification({
      text: `Memories successfully sent down the rabbit hole!`,
      type: 'success'
    })).catch((error) => {
      currentState.error = getErrorMessage(error)
    })
  }

  const sendWebsite = (url: string) => {
    currentState.loading = true
    RabbitHoleService.sendWeb(url).then((data) => {
      currentState.loading = false
      currentState.data = data
    }).then(() => showNotification({
      text: `Website successfully sent down the rabbit hole!`,
      type: 'success'
    })).catch((error) => {
      currentState.error = getErrorMessage(error)
    })
  }

  return {
    currentState,
    sendFile,
    sendWebsite,
    sendMemory
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRabbitHole, import.meta.hot))
}