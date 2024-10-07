import type { SettingsConfigState } from '@stores/types'
import AuthConfigService from '@services/AuthConfigService'
import { useNotifications } from '@stores/useNotifications'
import type { JSONSettings } from '@models/JSONSchema'

export const useAuthConfig = defineStore('auth', () => {
	const currentState = reactive<SettingsConfigState>({
		loading: false,
		settings: {},
	})

	const { sendNotificationFromJSON } = useNotifications()

	const {
		state: handlers,
		isLoading,
		execute,
	} = useAsyncState(AuthConfigService.getHandlers, undefined, {
		resetOnExecute: false,
	})

	const getAvailableHandlers = computed(() => {
		const settings = handlers.value?.data?.settings
		const schemas = settings ? settings.map(s => s.schema) : []
		if (schemas.length === 0) currentState.error = 'No auth handlers found'
		return schemas as Record<string, any>[]
	})

	watchEffect(() => {
		currentState.loading = isLoading.value
		currentState.data = handlers.value?.data
		currentState.error = handlers.value?.status === 'error' ? handlers.value.message : undefined

		if (currentState.data) {
			currentState.selected = currentState.data.selected_configuration ?? currentState.data.settings[0].schema?.title
			currentState.settings = currentState.data.settings.reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {})
		}
	})

	const getHandlerSchema = (selected = currentState.selected) => {
		if (!selected) return undefined
		return getAvailableHandlers.value.find(schema => schema?.title === selected)
	}

	const getHandlerSettings = (selected = currentState.selected) => {
		if (!selected) return {} satisfies JSONSettings
		return currentState.settings[selected] ?? ({} satisfies JSONSettings)
	}

	const setHandlerSettings = async (name: string, settings: JSONSettings) => {
		currentState.loading = true
		const result = await AuthConfigService.setHandlerSettings(name, settings)
		currentState.loading = false
		sendNotificationFromJSON(result)
		if (result.status != 'error') {
			currentState.selected = name
			currentState.settings[name] = settings
		}
		return result.status != 'error'
	}

	return {
		currentState,
		getAvailableHandlers,
		setHandlerSettings,
		getHandlerSchema,
		getHandlerSettings,
		refreshSettings: execute,
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAuthConfig, import.meta.hot))
}
