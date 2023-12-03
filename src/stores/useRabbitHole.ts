import type { FileUploaderState } from '@stores/types'
import { useNotifications } from '@stores/useNotifications'
import { useMessages } from '@stores/useMessages'
import RabbitHoleService from '@services/RabbitHoleService'

export const useRabbitHole = defineStore('rabbitHole', () => {
	const currentState = reactive<FileUploaderState>({
		loading: false,
	})

	const { sendNotificationFromJSON } = useNotifications()
	const { dispatchMessage } = useMessages()

	const sendFile = async (file: File) => {
		currentState.loading = true
		const res = await RabbitHoleService.sendFile(file)
		currentState.loading = false
		currentState.data = res.data
		if (res.data && res.status == 'success') dispatchMessage(file)
		sendNotificationFromJSON(res)
	}

	const sendWebsite = async (url: string) => {
		currentState.loading = true
		const res = await RabbitHoleService.sendWeb(url)
		currentState.loading = false
		currentState.data = res.data
		sendNotificationFromJSON(res)
	}

	const sendMemory = async (file: File) => {
		currentState.loading = true
		const res = await RabbitHoleService.sendMemory(file)
		currentState.loading = false
		currentState.data = res.data
		sendNotificationFromJSON(res)
	}

	const getAllowedMimetypes = async () => await RabbitHoleService.getAllowedMimetypes()

	return {
		currentState,
		sendFile,
		sendWebsite,
		sendMemory,
		getAllowedMimetypes,
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useRabbitHole, import.meta.hot))
}
