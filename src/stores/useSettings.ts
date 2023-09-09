import { apiClient, tryRequest, type AuthForm } from '@/api'

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

	const authSettings = useLocalStorage<AuthForm>('authSettings', {
		baseUrl: 'localhost',
		authKey: '',
		port: 1865,
		secure: false
	})

	const isAuth = ref(false)

	const getStatus = async () => {
		const result = await tryRequest(
			apiClient.value?.api?.status.home(),
			'Getting Cheshire Cat status',
			'Unable to fetch Cheshire Cat status',
		)
		return result.data
	}

	const { state: cat } = useAsyncState(getStatus(), undefined)

	return {
		isAudioEnabled,
		isDark,
		pluginsFilters,
		toggleDark,
		cat,
		authSettings,
		isAuth
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot))
}
