import { apiClient, tryRequest } from '@/api'
import type { PromptSettings } from 'ccat-api'
import { defaultsDeep } from 'lodash'

interface Filter {
	[k: string]: {
		values: string[]
		current: string
	}
}

export const useSettings = defineStore('settings', () => {
	const isReadyAndAuth = ref(false)

	const isAudioEnabled = useLocalStorage('isAudioEnabled', true)

	const isDark = useDark({
		storageKey: 'currentTheme',
		selector: 'html',
		disableTransition: false,
		attribute: 'data-theme',
		valueDark: 'dark',
		valueLight: 'light',
	})

	const toggleDark = useToggle(isDark)
	
	const promptSettings = useLocalStorage<PromptSettings>('promptSettings', {} as PromptSettings)

	const pluginsFilters = useLocalStorage<Filter>('pluginsFilters', {
		presence: {
			current: 'both',
			values: ['both', 'installed', 'registry'],
		},
		visibility: {
			current: 'both',
			values: ['both', 'enabled', 'disabled'],
		},
	})

	const getStatus = async () => {
		const result = await tryRequest(
			apiClient.api?.status.home(),
			'Getting Cheshire Cat status',
			'Unable to fetch Cheshire Cat status',
		)
		return result.data
	}

	const getPromptSettings = async () => {
		const result = await tryRequest(
			apiClient.api?.prompt.getDefaultPromptSettings(),
			'Getting all the default prompt settings',
			'Unable to fetch default prompt settings',
		)
		return result.data
	}

	const { state: defaultPromptSettings, isReady: isOkPrompt } = useAsyncState(getPromptSettings(), undefined)

	const { state: cat, isReady: isOkStatus } = useAsyncState(getStatus(), undefined)

	watchEffect(() => {
		const statusError = cat.value == undefined, promptError = defaultPromptSettings.value == undefined
		isReadyAndAuth.value = !(statusError || promptError) && (isOkPrompt.value && isOkStatus.value)
		defaultsDeep(promptSettings.value, defaultPromptSettings.value)
	})

	return {
		isAudioEnabled,
		isDark,
		pluginsFilters,
		toggleDark,
		cat,
		getPromptSettings,
		promptSettings,
		isReadyAndAuth
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot))
}
