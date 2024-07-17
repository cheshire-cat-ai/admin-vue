
interface Filter {
	[k: string]: {
		values: string[]
		current: string
	}
}

export const useSettings = defineStore('settings', () => {
	

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

	return {
		isDark,
		pluginsFilters,
		toggleDark
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot))
}
