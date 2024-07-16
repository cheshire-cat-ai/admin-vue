<script setup lang="ts">
import { createMongoAbility } from '@casl/ability'
import { useApiClient } from './composables/useApiClient'
import LogService from '@services/LogService'
import { useAbility } from '@casl/vue'

const perms = useAbility()
const { jwt } = useApiClient()

onBeforeMount(() => {

	// TODO: can this stuff be moved in api.ts or in perms.ts?
	const payload = jwt.value
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
