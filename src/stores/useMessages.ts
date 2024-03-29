import type { MessagesState } from '@stores/types'
import type { BotMessage, UserMessage } from '@models/Message'
import { uniqueId } from 'lodash'
import { useNotifications } from '@stores/useNotifications'
import { apiClient } from '@/api'
import { useSettings } from '@stores/useSettings'
import MemoryService from '@services/MemoryService'

export const useMessages = defineStore('messages', () => {
	const currentState = reactive<MessagesState>({
		ready: false,
		loading: false,
		messages: [],
		defaultMessages: [
			"What's up?",
			"Who's the Queen of Hearts?",
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
			'Is Wonderland a real place?',
		],
	})

	const { state: history } = useAsyncState(MemoryService.getConversation, [])

	watchEffect(() => {
		history.value.forEach(({ who, message, why, when }) => {
			addMessage({
				text: message,
				sender: who == 'AI' ? 'bot' : 'user',
				when: when ? new Date(when * 1000) : new Date(),
				why,
			})
		})
		currentState.loading = false
	})

	const { isReadyAndAuth } = storeToRefs(useSettings())
	const { showNotification } = useNotifications()

	watchEffect(() => {
		/**
		 * Subscribes to the messages service on component mount
		 * and dispatches the received messages to the store.
		 * It also dispatches the error to the store if an error occurs.
		 */
		currentState.loading = !isReadyAndAuth.value
		currentState.ready = isReadyAndAuth.value

		apiClient
			.onConnected(() => {
				currentState.ready = true
			})
			.onMessage(({ content, type, why }) => {
				switch (type) {
					case 'chat_token': {
						if (currentState.generating == undefined) {
							const id = addMessage({
								text: content,
								sender: 'bot',
								when: new Date(),
								why,
							})
							currentState.generating = id
						} else {
							const index = currentState.messages.findIndex(m => m.id === currentState.generating)
							if (index !== -1) currentState.messages[index].text += content
						}
						break
					}
					case 'chat': {
						if (currentState.generating) {
							const index = currentState.messages.findIndex(m => m.id === currentState.generating)
							currentState.messages[index].text = content
							;(currentState.messages[index] as BotMessage).why = why
							currentState.generating = undefined
						} else {
							addMessage({
								text: content,
								sender: 'bot',
								when: new Date(),
								why,
							})
						}
						break
					}
					case 'notification':
						showNotification({
							type: 'info',
							text: content,
						})
						break
					default:
						break
				}
			})
			.onError(error => {
				currentState.loading = currentState.ready = false
				currentState.error = error.description
			})
			.onDisconnected(() => {
				currentState.ready = false
			})
	})

	tryOnUnmounted(() => {
		/**
		 * Unsubscribes to the messages service on component unmount
		 */
		apiClient.close()
	})

	/**
	 * Adds a message to the list of messages
	 */
	const addMessage = (message: Omit<BotMessage, 'id'> | Omit<UserMessage, 'id'>) => {
		currentState.error = undefined
		const id = uniqueId('m_')
		const msg = {
			id,
			...message,
		}
		currentState.messages.push(msg)
		if (!(message as UserMessage)?.file) currentState.loading = msg.sender === 'user'
		return id
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
	 * Sends a message to the messages service and dispatches it to the store
	 */
	const dispatchMessage = (message: string | File, store = true) => {
		if (typeof message === 'string') {
			apiClient.send(message)
			if (store)
				addMessage({
					text: message.trim(),
					when: new Date(),
					sender: 'user',
				})
		} else {
			if (store)
				addMessage({
					text: '',
					when: new Date(),
					sender: 'user',
					file: message,
				})
		}
	}

	return {
		currentState,
		history,
		addMessage,
		selectRandomDefaultMessages,
		dispatchMessage,
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useMessages, import.meta.hot))
}
