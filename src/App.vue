<script setup lang="ts">
import ModalBox from '@components/ModalBox.vue'
import { updateClient, apiClient, type AuthForm } from '@/api'
import { useSettings } from '@stores/useSettings'

const { isAuth } = storeToRefs(useSettings())

const authBox = ref<InstanceType<typeof ModalBox>>()
const clientConfig = reactive<AuthForm>({
	baseUrl: 'localhost',
	authKey: '',
	port: '1865',
	secure: false
})

const authenticate = () => {
	updateClient(clientConfig)
	apiClient.value?.api?.status.home().then(() => {
		isAuth.value = true
		authBox.value?.toggleModal()
	}).catch(() => {
		console.log("error!")
	})
}
</script>

<template>
	<div class="flex min-h-screen flex-col scroll-smooth bg-base-100 text-sm text-neutral transition-colors selection:bg-primary md:text-base">
		<Header />
		<NotificationStack />
		<ModalBox ref="authBox" shown :closable="false">
			<div class="flex flex-col items-center justify-center gap-4 text-neutral">
				<h3 class="text-xl font-bold text-primary md:text-2xl">
					Authentication
				</h3>
				<div class="flex gap-4">
					<div class="form-control w-full">
						<label class="label">
							<span class="label-text font-medium text-primary">Base URL</span>
						</label>
						<input v-model="clientConfig.baseUrl" placeholder="localhost" type="text" class="input-primary input input-sm">
					</div>
					<div class="form-control">
						<label class="label">
							<span class="label-text font-medium text-primary">Port</span>
						</label>
						<input v-model="clientConfig.port" placeholder="1865" type="number" class="input-primary input input-sm w-24 pr-0">
					</div>
				</div>
				<div class="form-control">
					<label class="label">
						<span class="label-text font-medium text-primary">Auth Key</span>
					</label>
					<input v-model="clientConfig.authKey" type="text" class="input-primary input input-sm">
				</div>
				<div class="my-2 flex gap-2">
					<input v-model="clientConfig.secure" type="checkbox" class="!toggle !toggle-success">
					<p>Secure protocols</p>
				</div>
				<button class="btn btn-error btn-sm" @click="authenticate">
					Authenticate
				</button>
			</div>
		</ModalBox>
		<RouterView v-slot="{ Component }" class="grow p-2 md:p-4">
			<template v-if="Component">
				<Transition mode="out-in"
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
