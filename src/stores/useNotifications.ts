import type { JSONResponse } from '@models/JSONSchema'
import type { Notification } from '@models/Notification'
import type { NotificationsState } from '@stores/types'
import { uniqueId } from 'lodash'

export const useNotifications = defineStore('notifications', () => {
  const currentState = reactive<NotificationsState>({
    history: []
  })

  const getNotifications = () => {
    return currentState.history.filter(notification => !notification.hidden)
  }

  const sendNotification = (notification: Omit<Notification, 'id'>) => {
    const notif = {
      id: uniqueId('n_'),
      ...notification
    }
    currentState.history.push(notif)
    return notif.id
  }

  const hideNotification = (id: Notification['id']) => {
    const notificationIndex = currentState.history.findIndex(notification => notification.id === id)
    if (notificationIndex >= 0 && notificationIndex < currentState.history.length) {
      currentState.history[notificationIndex].hidden = true
    }
  }

  const sendNotificationFromJSON = (result: JSONResponse) => {
    showNotification({
      type: result.status,
      text: result.message
    })
    return result.status != 'error'
  }

  const showNotification = (notification: Omit<Notification, 'id'>, timeout = 3000) => {
    const id = sendNotification(notification)
    const to = setTimeout(() => {
      hideNotification(id)
      clearTimeout(to)
    }, timeout)
  }

  return {
    currentState,
    sendNotification,
    hideNotification,
    getNotifications,
    showNotification,
    sendNotificationFromJSON
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotifications, import.meta.hot))
}