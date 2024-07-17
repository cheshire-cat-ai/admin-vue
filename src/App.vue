<script setup lang="ts">
import { createMongoAbility } from '@casl/ability'
import { useSettings } from '@stores/useSettings'
import { instantiateApiClient } from '@services/ApiService'
import { useAbility } from '@casl/vue'
import LogService from '@services/LogService'
import { useJwt } from '@vueuse/integrations/useJwt'
import { useCookies } from '@vueuse/integrations/useCookies'
import type { AuthPermission, AuthResource } from 'ccat-api'
import type { JwtPayload } from 'jwt-decode'


type AuthToken = JwtPayload & {
	username: string
	permissions: Record<AuthResource, AuthPermission[]>
}

const perms = useAbility()
const cookies = useCookies(['ccat_user_token'], { doNotParse: true, autoUpdateDependencies: true })
const cookie = computed(() => cookies.get<string | undefined>('ccat_user_token'))
const jwt = computed(() => {
	if (!cookie.value) return null
	const { payload } = useJwt<AuthToken>(cookie.value)
	return payload.value
})

onBeforeMount(() => {

	const payload = jwt.value
	if (payload) instantiateApiClient(cookie.value)
	perms.update(
		createMongoAbility(
			payload === null
				? []
				: Object.entries(payload.permissions).map(([subject, action]) => ({
						subject,
						action,
					})),
		).rules,
	)
	if (payload) LogService.success(`Authenticated as ${payload.username}`)
})
</script>

<template>
	<div
		class="flex min-h-screen flex-col scroll-smooth bg-base-300 text-sm text-neutral transition-colors selection:bg-primary md:text-base">
		<Header />
		<NotificationStack />
		<RouterView v-slot="{ Component }" class="grow p-2 md:p-4">
			<template v-if="Component">
				<Transition
					mode="out-in"
					enterActiveClass="animate__animated animate__fadeIn animate__fastest"
					leaveActiveClass="animate__animated animate__fadeOut animate__fastest">
					<KeepAlive>
						<component :is="Component" />
					</KeepAlive>
				</Transition>
			</template>
		</RouterView>
	</div>
</template>
