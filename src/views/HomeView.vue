<script setup lang="ts">
import { useRabbitHole } from '@stores/useRabbitHole'
import { useMessages } from '@stores/useMessages'
import { useSound } from '@vueuse/sound'
import { useMemory } from '@stores/useMemory'
import { AcceptedContentTypes } from '@models/RabbitHole'
import { useSettings } from '@stores/useSettings'
import SidePanel from '@components/SidePanel.vue'
import ModalBox from '@components/ModalBox.vue'

const messagesStore = useMessages()
const { dispatchMessage, selectRandomDefaultMessages } = messagesStore
const { currentState: messagesState } = storeToRefs(messagesStore)

const userMessage = ref(''), insertedURL = ref(''), isScrollable = ref(false), isTwoLines = ref(false)
const boxUploadURL = ref<InstanceType<typeof ModalBox>>()
const chatSettingsPanel = ref<InstanceType<typeof SidePanel>>()

const { textarea: textArea } = useTextareaAutosize({
	input: userMessage,
	onResize: () => {
		if (textArea.value) {
			isTwoLines.value = textArea.value.clientHeight >= 72
		}
	}
})

const { isListening, isSupported, toggle: toggleRecording, result: transcript } = useSpeechRecognition()
const { open: openFile, onChange: onFileUpload } = useFileDialog()
const { open: openMemory, onChange: onMemoryUpload } = useFileDialog()
const { play: playPop } = useSound('pop.mp3')
const { play: playRec } = useSound('start-rec.mp3')

const filesStore = useRabbitHole()
const { sendFile, sendWebsite, sendMemory } = filesStore
const { currentState: rabbitHoleState } = storeToRefs(filesStore)

const { wipeConversation } = useMemory()
const router = useRouter()
const { isAudioEnabled } = storeToRefs(useSettings())

const inputDisabled = computed(() => {
	return messagesState.value.loading || !messagesState.value.ready || Boolean(messagesState.value.error)
})

const randomDefaultMessages = selectRandomDefaultMessages()

/**
 * Handles the file upload by calling the Rabbit Hole endpoint with the file attached.
 */
onFileUpload(files => {
	if (files == null) return
	sendFile(files[0])
})

/**
 * Handles the memory upload by calling the Rabbit Hole endpoint with the file attached.
 */
onMemoryUpload(files => {
	if (files == null) return
	sendMemory(files[0])
})

/**
 * When the user stops recording, the transcript will be sent to the messages service.
 */
watchEffect(() => {
	if (transcript.value === '') return
	userMessage.value = transcript.value
})

/**
 * Toggle recording and plays an audio if enabled
 */
const toggleListening = () => {
	toggleRecording()
	if (isListening.value && isAudioEnabled.value) playRec()
}

/**
 * When a new message arrives, the chat will be scrolled to bottom and the input box will be focussed.
 * If audio is enabled, a pop sound will be played.
 */
watchDeep(messagesState, () => {
	isScrollable.value = document.documentElement.scrollHeight > document.documentElement.clientHeight
	scrollToBottom()
	textArea.value?.focus()
	if (messagesState.value.messages.length > 0 && isAudioEnabled.value) playPop()
}, { flush: 'post' })

/**
 * When switching to the page, the input box is focussed.
 */
onActivated(() => {
	textArea.value?.focus()
})

/**
 * Dispatches the inserted url to the RabbitHole service and closes the modal.
 */
const dispatchWebsite = () => {
	if (!insertedURL.value) return
	sendWebsite(insertedURL.value)
	boxUploadURL.value?.toggleModal()
}

/**
 * Dispatches the user's message to the Messages service.
 */
const sendMessage = (message: string) => {
	if (message === '') return
	userMessage.value = ''
	dispatchMessage(message)
}

/**
 * Prevent sending the message if the shift key is pressed.
 */
const preventSend = (e: KeyboardEvent) => {
	if (e.key === 'Enter' && !e.shiftKey) {
		e.preventDefault()
		sendMessage(userMessage.value)
	}
}

const openChatSettings = () => {
	router.push({ name: 'chat_settings' })
	chatSettingsPanel.value?.togglePanel()
}

const generatePlaceholder = (isLoading: boolean, isRecording: boolean, error?: string) => {
	if (error) return 'Well, well, well, looks like something has gone amiss'
	if (isLoading) return 'The enigmatic Cheshire cat is pondering...'
	if (isRecording) return 'The curious Cheshire cat is all ears...'
	return 'Ask the Cheshire Cat...'
}

const scrollToBottom = () => window.scrollTo({ behavior: 'smooth', left: 0, top: document.body.scrollHeight })
</script>

<template>
	<div class="flex w-full max-w-screen-lg flex-col justify-center gap-4 self-center overflow-hidden !pt-0 text-sm"
		:class="{
			'pb-16 md:pb-20': !isTwoLines,
			'pb-20 md:pb-24': isTwoLines,
		}">
		<div v-if="!messagesState.ready" class="flex grow items-center justify-center self-center">
			<p v-if="messagesState.error" class="w-fit rounded-md bg-error p-4 font-semibold text-base-100">
				{{ messagesState.error }}
			</p>
			<p v-else class="flex flex-col items-center justify-center gap-2">
				<span class="loading loading-spinner loading-lg text-primary" />
				<span class="text-lg font-medium text-neutral">Getting ready...</span>
			</p>
		</div>
		<div v-else-if="messagesState.messages.length" class="flex grow flex-col overflow-y-auto">
			<MessageBox v-for="msg in messagesState.messages"
				:key="msg.id"
				:sender="msg.sender"
				:text="msg.text"
				:why="msg.sender === 'bot' ? msg.why : ''" />
			<p v-if="messagesState.error" class="w-fit rounded-md bg-error p-4 font-semibold text-base-100">
				{{ messagesState.error }}
			</p>
			<div v-else-if="!messagesState.error && messagesState.loading" class="mb-2 ml-2 flex items-center gap-2">
				<span class="text-lg">😺</span>
				<p class="flex items-center gap-2">
					<span class="loading loading-dots loading-xs" />
					Cheshire cat is thinking...
				</p>
			</div>
		</div>
		<div v-else class="flex grow cursor-pointer flex-col items-center justify-center gap-4 p-4">
			<div v-for="(msg, index) in randomDefaultMessages" :key="index" class="btn-neutral btn font-medium normal-case text-base-100 shadow-lg"
				@click="sendMessage(msg)">
				{{ msg }}
			</div>
		</div>
		<div class="fixed bottom-0 left-0 flex w-full items-center justify-center bg-gradient-to-t from-base-100 px-2 py-4">
			<div class="flex w-full max-w-screen-lg items-center gap-2 md:gap-4">
				<label class="swap btn-circle btn border-none bg-transparent text-primary hover:bg-base-300">
					<input v-model="isAudioEnabled" type="checkbox" class="modal-toggle">
					<heroicons-speaker-wave-solid class="swap-on h-6 w-6" />
					<heroicons-speaker-x-mark-solid class="swap-off h-6 w-6" />
				</label>
				<div class="relative w-full">
					<textarea ref="textArea" v-model="userMessage" :disabled="inputDisabled"
						class="textarea block max-h-20 w-full resize-none !outline-offset-0" :class="[ isTwoLines ? 'pr-10' : 'pr-20' ]"
						:placeholder="generatePlaceholder(messagesState.loading, isListening, messagesState.error)" @keydown="preventSend" />
					<div :class="[ isTwoLines ? 'flex-col-reverse' : '' ]" class="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
						<button :disabled="inputDisabled || userMessage.length === 0"
							class="btn-ghost btn-sm btn-circle btn self-center"
							@click="sendMessage(userMessage)">
							<heroicons-paper-airplane-solid class="h-6 w-6" />
						</button>
						<div class="dropdown-top dropdown-end dropdown self-center">
							<button tabindex="0" :disabled="inputDisabled" class="btn-ghost btn-sm btn-circle btn">
								<heroicons-bolt-solid class="h-6 w-6" />
							</button>
							<ul tabindex="0" class="dropdown-content join-vertical join !-right-1/4 z-10 mb-5 p-0">
								<li>
									<button :disabled="rabbitHoleState.loading"
										class="join-item btn w-full flex-nowrap px-2" 
										@click="openChatSettings">
										<span class="grow normal-case">Prompt settings</span>
										<span class="rounded-lg bg-primary p-1 text-base-100">
											<heroicons-adjustments-horizontal-solid class="h-6 w-6" />
										</span>
									</button>
								</li>
								<li>
									<!-- :disabled="rabbitHoleState.loading" -->
									<button disabled
										class="join-item btn w-full flex-nowrap px-2" 
										@click="openMemory({ multiple: false, accept: 'application/json' })">
										<span class="grow normal-case">Upload memories</span>
										<span class="rounded-lg bg-success p-1 text-base-100">
											<ph-brain-fill class="h-6 w-6" />
										</span>
									</button>
								</li>
								<li>
									<button :disabled="rabbitHoleState.loading" 
										class="join-item btn w-full flex-nowrap px-2" 
										@click="boxUploadURL?.toggleModal()">
										<span class="grow normal-case">Upload url</span>
										<span class="rounded-lg bg-info p-1 text-base-100">
											<heroicons-globe-alt class="h-6 w-6" />
										</span>
									</button>
								</li>
								<li>
									<button :disabled="rabbitHoleState.loading" 
										class="join-item btn w-full flex-nowrap px-2" 
										@click="openFile({ multiple: false, accept: AcceptedContentTypes.join(', ') })">
										<span class="grow normal-case">Upload file</span>
										<span class="rounded-lg bg-warning p-1 text-base-100">
											<heroicons-document-text-solid class="h-6 w-6" />
										</span>
									</button>
								</li>
								<li>
									<button :disabled="messagesState.messages.length === 0" 
										class="join-item btn w-full flex-nowrap px-2" 
										@click="wipeConversation()">
										<span class="grow normal-case">Clear conversation</span>
										<span class="rounded-lg bg-error p-1 text-base-100">
											<heroicons-trash-solid class="h-6 w-6" />
										</span>
									</button>
								</li>
							</ul>
						</div>
					</div>
				</div>
				<button v-if="isSupported" class="btn-primary btn-circle btn" :class="[isListening ? 'btn-outline glass' : '']"
					:disabled="inputDisabled" @click="toggleListening">
					<heroicons-microphone-solid class="h-6 w-6" />
				</button>
			</div>
			<button v-if="isScrollable" class="btn-primary btn-outline btn-sm btn-circle btn absolute bottom-24 right-4 bg-base-100"
				@click="scrollToBottom">
				<heroicons-arrow-down-20-solid class="h-5 w-5" />
			</button>
		</div>
		<ModalBox ref="boxUploadURL">
			<div class="flex flex-col items-center justify-center gap-4 text-neutral">
				<h3 class="text-lg font-bold">
					Insert URL
				</h3>
				<p>Write down the URL you want the Cat to digest :</p>
				<input v-model="insertedURL" type="text" placeholder="Enter url..."
					class="input-bordered input-primary input input-sm w-full">
				<button class="btn-primary btn-sm btn" @click="dispatchWebsite">
					Send
				</button>
			</div>
		</ModalBox>
		<SidePanel ref="chatSettingsPanel" title="Prompt Settings">
			<RouterView @close="chatSettingsPanel?.togglePanel()" />
		</SidePanel>
	</div>
</template>
