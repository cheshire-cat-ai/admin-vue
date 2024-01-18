import type { JSONSettings } from '@models/JSONSchema'
import EmbedderConfigService from '@services/EmbedderConfigService'
import { useNotifications } from '@stores/useNotifications'
import type { SettingsConfigState } from '@stores/types'

export const useEmbedderConfig = defineStore('embedder', () => {
	const currentState = reactive<SettingsConfigState>({
		loading: false,
		settings: {},
	})

	const { sendNotificationFromJSON } = useNotifications()

	const {
		state: embedders,
		isLoading,
		execute,
	} = useAsyncState(EmbedderConfigService.getEmbedders, undefined, {
		resetOnExecute: false,
	})

	const getAvailableEmbedders = computed(() => {
		const settings = embedders.value?.data?.settings
		const schemas = settings ? settings.map(s => s.schema) : []
		if (schemas.length === 0) currentState.error = 'No embedders found'
		return schemas as Record<string, any>[]
	})

	watchEffect(() => {
		currentState.loading = isLoading.value
		currentState.data = embedders.value?.data
		currentState.error = embedders.value?.status === 'error' ? embedders.value.message : undefined

		if (currentState.data) {
			currentState.selected = currentState.data.selected_configuration ?? currentState.data.settings[0].schema?.title
			currentState.settings = currentState.data.settings.reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {})
		}
	})

	const getEmbedderSchema = (selected = currentState.selected) => {
		if (!selected) return undefined
		return getAvailableEmbedders.value.find(schema => schema?.title === selected)
	}

	const getEmbedderSettings = (selected = currentState.selected) => {
		if (!selected) return {} satisfies JSONSettings
		return currentState.settings[selected] ?? ({} satisfies JSONSettings)
	}

	const setEmbedderSettings = async (name: string, settings: JSONSettings) => {
		currentState.loading = true
		const result = await EmbedderConfigService.setEmbedderSettings(name, settings)
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
		getAvailableEmbedders,
		getEmbedderSchema,
		getEmbedderSettings,
		setEmbedderSettings,
		refreshSettings: execute,
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useEmbedderConfig, import.meta.hot))
}
