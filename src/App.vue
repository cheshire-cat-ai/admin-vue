<script setup lang="ts">
import { useSettings } from '@stores/useSettings'
import ModalBox from '@components/ModalBox.vue'
import { updateAuthKey } from '@/api'
import useStoreMapping from '@/utils/storeRouteMapping'
import vLock from '@/directives/vLock'

const routesToExclude = ['home', 'settings']
const route = useRoute()
const { storeMapping } = useStoreMapping()
const settings = useSettings()
const { getStatus } = settings
const { isReadyAndAuth } = storeToRefs(settings)

const authBox = ref<InstanceType<typeof ModalBox>>()
const authKey = ref(''),
	hasError = ref(false)

const authenticate = async () => {
	hasError.value = false
	updateAuthKey(authKey.value)
	const status = await getStatus()
	hasError.value = status == undefined
	if (!hasError.value) {
		authBox.value?.toggleModal()
		isReadyAndAuth.value = true
		// TODO: Fix the composable
		//resetAllStores()
	}
}

const currentComponentLoading = computed(() => {
	const routeName = route.name?.toString()
	let store
	if (routeName !== undefined && !routesToExclude.includes(routeName)) {
		store = storeMapping[routeName]
		const { currentState } = storeToRefs(store)
		return (store && currentState.value.loading)
	}
	return false
})
</script>

<template>
	<div
		class="flex min-h-screen flex-col scroll-smooth bg-base-200 text-sm text-neutral transition-colors selection:bg-primary md:text-base">
		<Teleport to="#modal">
			<ModalBox ref="authBox" :shown="!isReadyAndAuth" :closable="false">
				<div class="flex flex-col items-center justify-center gap-4 p-2 text-neutral">
					<h3 class="text-xl font-bold md:text-2xl">Authentication</h3>
					<InputBox
						v-model="authKey"
						label="Auth Key"
						:error="hasError ? 'Invalid auth key, please try again.' : ''"
						@send="authenticate()" />
					<button class="btn btn-success btn-sm mt-4" @click="authenticate()">Authenticate</button>
				</div>
			</ModalBox>
		</Teleport>
		<Header />
		<NotificationStack />
		<RouterView v-slot="{ Component }" class="grow p-2 md:p-4">
			<template v-if="Component">
				<Transition
					mode="out-in"
					enterActiveClass="animate__animated animate__fadeIn animate__fastest"
					leaveActiveClass="animate__animated animate__fadeOut animate__fastest">
					<KeepAlive>
						<component :is="Component" v-lock="currentComponentLoading" :currentComponentLoading="currentComponentLoading"/>
					</KeepAlive>
				</Transition>
			</template>
		</RouterView>
	</div>
</template>
