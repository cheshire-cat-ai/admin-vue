import { apiClient, tryRequest } from '@/api'
import { merge } from 'lodash'

interface Filter {
	[k: string]: {
		values: string[]
		current: string
	}
}

export const useSettings = defineStore('settings', () => {
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

	const currentFilters = useLocalStorage<Filter>(
		'currentFilters',
		{
			presence: {
				current: 'both',
				values: ['both', 'installed', 'registry'],
			},
			visibility: {
				current: 'both',
				values: ['both', 'enabled', 'disabled'],
			},
		},
		{ mergeDefaults: (storageValue, defaults) => merge(storageValue, defaults) },
	)

	const getStatus = async () => {
		const result = await tryRequest(
			apiClient.api?.status.home(),
			'Getting Cheshire Cat status',
			'Unable to fetch Cheshire Cat status',
		)
		return result.data
	}

	const { state: cat } = useAsyncState(getStatus(), undefined)

	return {
		isAudioEnabled,
		isDark,
		currentFilters,
		toggleDark,
		cat,
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot))
}
