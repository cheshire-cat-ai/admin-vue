import { apiClient, tryRequest } from '@/api'
import { useJwt } from '@vueuse/integrations/useJwt'
import { useCookies } from '@vueuse/integrations/useCookies'
import type { Status, AuthPermission, AuthResource } from 'ccat-api'
import type { JwtPayload } from 'jwt-decode'

interface Filter {
	[k: string]: {
		values: string[]
		current: string
	}
}

type AuthToken = JwtPayload & {
	username: string
	permissions: Record<AuthResource, AuthPermission[]>
}

export const useSettings = defineStore('settings', () => {
	const cookies = useCookies(['ccat_user_token'], { doNotParse: true, autoUpdateDependencies: true })

	const cookie = computed(() => cookies.get<string | undefined>('ccat_user_token'))

	const jwt = computed(() => {
		if (!cookie.value) return null
		const { payload } = useJwt<AuthToken>(cookie.value)
		return payload.value
	})

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
		const result = await tryRequest(apiClient.api?.status.home(), 'Getting Cheshire Cat status', 'Unable to fetch Cheshire Cat status')
		return result.data ?? result.message
	}

	const { state: cat, execute } = useAsyncState(getStatus, {} as Status)

	return {
		isDark,
		pluginsFilters,
		toggleDark,
		cat,
		cookie,
		jwt,
		getStatus,
		refreshStatus: execute,
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot))
}
