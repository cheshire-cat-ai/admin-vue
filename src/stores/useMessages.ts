import type { MessagesState } from '@stores/types'
import type { BotMessage, PromptSettings, UserMessage } from '@models/Message'
import MessagesService from '@services/MessageService'
import { now, uniqueId, defaultsDeep } from 'lodash'
import { getErrorMessage } from '@utils/errors'
import { useNotifications } from '@stores/useNotifications'
import { get, tryRequest } from '@/api'

export const useMessages = defineStore('messages', () => {
  const currentState = reactive<MessagesState>({
    ready: false,
    loading: false,
    messages: [],
    defaultMessages: [
      'What\'s up?',
      'Who\'s the Queen of Hearts?',
      'Where is the white rabbit?',
      'What is Python?',
      'How do I write my own AI app?',
      'Does pineapple belong on pizza?',
      'What is the meaning of life?',
      'What is the best programming language?',
      'What is the best pizza topping?',
      'What is a language model?',
      'What is a neural network?',
      'What is a chatbot?',
      'What time is it?',
      'Is AI capable of creating art?',
      'What is the best way to learn AI?',
      'Is it worth learning AI?',
      'Who is the Cheshire Cat?',
      'Is Alice in Wonderland a true story?',
      'Who is the Mad Hatter?',
      'How do I find my way to Wonderland?',
      'Is Wonderland a real place?'
    ]
  })

  const promptSettings = useLocalStorage<PromptSettings>("promptSettings", {
    prefix: ""
  } as PromptSettings)

  const { showNotification } = useNotifications()

  tryOnMounted(async () => {
    const defaultPromptSettings = await getDefaultPromptSettings()
    defaultsDeep(promptSettings.value, defaultPromptSettings)

    /**
     * Subscribes to the messages service on component mount
     * and dispatches the received messages to the store.
     * It also dispatches the error to the store if an error occurs.
     */
    MessagesService.connect(() => {
      currentState.ready = true
    }).onMessage((message, type, why) => {
      if (type === 'chat') {
        addMessage({
          text: message,
          sender: 'bot',
          timestamp: now(),
          why
        })
      } else if (type === 'notification') {
        showNotification({
          type: 'info',
          text: message
        })
      }
    }).onError((error: Error) => {
      currentState.loading = currentState.ready = false
      currentState.error = getErrorMessage(error)
    })
  })

  tryOnUnmounted(() => {
    /**
     * Unsubscribes to the messages service on component unmount
     */
    MessagesService.disconnect()
  })

  /**
   * Adds a message to the list of messages
   */
  const addMessage = (message: Omit<BotMessage, 'id'> | Omit<UserMessage, 'id'>) => {
    currentState.error = undefined
    const msg = {
      id: uniqueId('m_'),
      ...message
    }
    currentState.messages.push(msg)
    currentState.loading = msg.sender === 'user'
  }

  /**
   * Selects 5 random default messages from the messages slice.
   */
  const selectRandomDefaultMessages = () => {
    const messages = [...currentState.defaultMessages]
    const shuffled = messages.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 5)
  }

  /**
   * Sends a message to the messages service and optimistically dispatches it to the store
   */
  const dispatchMessage = (message: string) => {
    MessagesService.send(message, promptSettings.value)
    addMessage({
      text: message.trim(),
      timestamp: now(),
      sender: 'user'
    })
  }

  const getDefaultPromptSettings = async () => {
    const result = await tryRequest(
      get('/settings/prompt/'), 
      "Getting all the default prompt settings", 
      "Unable to fetch default prompt settings"
    )
    return result.data
  }

  return {
    currentState,
    promptSettings,
    addMessage,
    selectRandomDefaultMessages,
    dispatchMessage
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessages, import.meta.hot))
}