import { apiClient, tryRequest } from '@/api'

interface Filter {
	[k: string]: {
		values: string[]
		current: string
	}
}

export const useSettings = defineStore('settings', () => {
	const isReadyAndAuth = ref(true)

	const isDark = useDark({
		storageKey: 'currentTheme',
		selector: 'html',
		disableTransition: false,
		attribute: 'data-theme',
		valueDark: 'dark',
		valueLight: 'light',
	})

	const toggleDark = useToggle(isDark)

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

	const { state: cat, isReady: isOkStatus } = useAsyncState(getStatus(), undefined)

	watchEffect(() => {
		const statusError = cat.value == undefined
		isReadyAndAuth.value = !statusError && isOkStatus.value
	})

	return {
		isDark,
		pluginsFilters,
		toggleDark,
		cat,
		getStatus,
		isReadyAndAuth,
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot))
}
