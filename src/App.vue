<script setup lang="ts">
import { createMongoAbility } from '@casl/ability'
import { useSettings } from '@stores/useSettings'
import { updateCredential } from './api'
import { useAbility } from '@casl/vue'
import LogService from '@services/LogService'

const { cookie, jwt } = storeToRefs(useSettings())
const perms = useAbility()

onBeforeMount(() => {
	const payload = jwt.value
	updateCredential(cookie.value)
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
