import type { AuthPermission, AuthResource } from 'ccat-api'
import type { JwtPayload } from 'jwt-decode'
import { useJwt } from '@vueuse/integrations/useJwt'
import { useCookies } from '@vueuse/integrations/useCookies'
import { useAbility } from '@casl/vue'
import { createMongoAbility } from '@casl/ability'

import { instantiateApiClient } from '@services/ApiService'
import LogService from '@services/LogService'
import type { LocationQueryRaw } from 'vue-router'

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

/**
 * App wide store, containing info used in multiple views and components
 */
export const useMainStore = defineStore('main', () => {
	/**
	 * Extract cookie from headers and JWT payload from it
	 */
	const cookies = useCookies(['ccat_user_token'], { doNotParse: true, autoUpdateDependencies: true })
	const cookie = computed({
		get: () => cookies.get<string | undefined>('ccat_user_token'),
		set: value => cookies.set('ccat_user_token', value),
	})
	const jwtPayload = computed(() => {
		if (!cookie.value) return null
		const { payload } = useJwt<AuthToken>(cookie.value)
		return payload.value
	})
	const perms = useAbility()

	tryOnBeforeMount(() => {
		if (jwtPayload.value) {
			instantiateApiClient(cookie.value)
			perms.update(
				createMongoAbility(
					jwtPayload.value === null
						? []
						: Object.entries(jwtPayload.value.permissions).map(([subject, action]) => ({
								subject,
								action,
							})),
				).rules,
			)
			LogService.success(`Authenticated as ${jwtPayload.value.username}`)
		}
	})

	/**
	 * Dark theme
	 */
	const isDark = useDark({
		storageKey: 'currentTheme',
		selector: 'html',
		disableTransition: false,
		attribute: 'data-theme',
		valueDark: 'dark',
		valueLight: 'light',
	})
	const toggleDark = useToggle(isDark)

	/**
	 * plugins filters
	 */
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

	const logoutCurrentUser = () => {
		const cookies = useCookies().getAll()
		Object.keys(cookies).forEach(key => delete cookies[key])
		cookie.value = ''
		//window.location.href = window.location.origin + '/auth/login'
	}

	return {
		isDark,
		pluginsFilters,
		toggleDark,
		cookie,
		jwtPayload,
		logoutCurrentUser,
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useMainStore, import.meta.hot))
}
