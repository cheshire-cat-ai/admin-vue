<script setup lang="ts">
import { useSound } from '@vueuse/sound'
import { useSettings } from '@stores/useSettings'
import type { Message } from '@models/Message'
import type { Notification } from '@models/Notification'

const { play: playPop } = useSound('pop.mp3')
//const { play: playRec } = useSound('start-rec.mp3')

const { isDark, isAudioEnabled } = storeToRefs(useSettings())

const chatConfig = computed(() => window.catCoreConfig)

const onMessage = (message: Message) => {
	console.log("Message:", message.text)
	if (isAudioEnabled.value) playPop()
}

const onUpload = (content: File | string) => {
	console.log("Uploaded content:", content instanceof File ? content.name : content)
}

const onNotification = (notification: Notification) => {
	console.log("Notification:", notification.text)
}
</script>

<template>
	<div class="m-auto flex h-full w-full max-w-screen-lg items-end gap-2">
		<label class="swap btn-circle btn border-none bg-transparent text-primary hover:bg-base-200">
			<input v-model="isAudioEnabled" type="checkbox" class="modal-toggle">
			<akar-icons-sound-on class="swap-on h-6 w-6" />
			<akar-icons-sound-off class="swap-off h-6 w-6" />
		</label>
		<cheshire-cat-chat class="fix-chat flex-auto"
			:api="chatConfig.API_KEY" 
			:secure="chatConfig.CORE_USE_SECURE_PROTOCOLS" 
			:url="`${chatConfig.CORE_HOST}:${chatConfig.CORE_PORT}`"
			:dark="isDark" 
			@message="(e: CustomEvent) => onMessage(e.detail)" 
			@upload="(e: CustomEvent) => onUpload(e.detail)" 
			@notification="(e: CustomEvent) => onNotification(e.detail)" />
	</div>
</template>

<style lang="scss" scoped>
	.fix-chat {
		height: calc(100vh - 80px);
	}

	@media (min-width: 768px) {
		.fix-chat {
			height: calc(100vh - 100px);
		}
	}
</style>