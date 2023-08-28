<script setup lang="ts">
import { useRabbitHole } from '@stores/useRabbitHole'
import { useMessages } from '@stores/useMessages'
import { useSound } from '@vueuse/sound'
import { useMemory } from '@stores/useMemory'
import { AcceptedMemoryTypes } from 'ccat-api'
import { useSettings } from '@stores/useSettings'
import SidePanel from '@components/SidePanel.vue'
import ModalBox from '@components/ModalBox.vue'

const messagesStore = useMessages()
const { dispatchMessage, selectRandomDefaultMessages } = messagesStore
const { currentState: messagesState } = storeToRefs(messagesStore)

const userMessage = ref(''),
	insertedURL = ref(''),
	isScrollable = ref(false),
	isTwoLines = ref(false)
const boxUploadURL = ref<InstanceType<typeof ModalBox>>()
const chatSettingsPanel = ref<InstanceType<typeof SidePanel>>()

const { textarea: textArea } = useTextareaAutosize({
	input: userMessage,
	onResize: () => {
		if (textArea.value) {
			isTwoLines.value = textArea.value.clientHeight >= 72
		}
	},
})

const { isListening, isSupported, toggle: toggleRecording, result: transcript } = useSpeechRecognition()
const { open: openFile, onChange: onFileUpload } = useFileDialog()
const { open: openMemory, onChange: onMemoryUpload } = useFileDialog()
const { play: playPop } = useSound('pop.mp3')
const { play: playRec } = useSound('start-rec.mp3')

const filesStore = useRabbitHole()
const { sendFile, sendWebsite, sendMemory, getAllowedMimetypes } = filesStore
const { currentState: rabbitHoleState } = storeToRefs(filesStore)

const { wipeConversation } = useMemory()
const router = useRouter()
const { isAudioEnabled } = storeToRefs(useSettings())

const inputDisabled = computed(() => {
	return messagesState.value.loading || !messagesState.value.ready || Boolean(messagesState.value.error)
})

const randomDefaultMessages = selectRandomDefaultMessages()

const dropContentZone = ref<HTMLDivElement>()

/**
 * Calls the specific endpoints based on the mime type of the file
 */
const contentHandler = (content: string | File[] | null) => {
	if (!content) return
	if (typeof content === 'string') {
		if (content.trim().length == 0) return
		try {
			new URL(content)
			sendWebsite(content)
		} catch (_) {
			dispatchMessage(content)
		}
	} else content.forEach(f => sendFile(f))
}

/**
 * Handles the drag & drop feature
 */
const { isOverDropZone } = useDropZone(dropContentZone, {
	onLeave: () => {
		isOverDropZone.value = false
	},
	onDrop: (files, evt) => {
		const text = evt.dataTransfer?.getData('text')
		contentHandler(text || files)
	},
})

/**
 * Handles the copy-paste feature
 */
useEventListener<ClipboardEvent>(dropContentZone, 'paste', evt => {
	if ((evt.target as HTMLElement).isEqualNode(textArea.value)) return
	const text = evt.clipboardData?.getData('text')
	const files = evt.clipboardData?.getData('file') || Array.from(evt.clipboardData?.files ?? [])
	contentHandler(text || files)
})

/**
 * Handles the file upload by calling the Rabbit Hole endpoint to check mimetypes.
 */
const uploadFile = async () => {
	const allowedMimetypes = await getAllowedMimetypes()
	openFile({ multiple: false, accept: allowedMimetypes?.join(',') })
}

onFileUpload(files => {
	if (!files) return
	const arr: File[] = []
	for (const file of files) arr.push(file)
	contentHandler(arr)
})

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
watchDeep(
	messagesState,
	() => {
		isScrollable.value = document.documentElement.scrollHeight > document.documentElement.clientHeight
		scrollToBottom()
		if (messagesState.value.messages.length > 0 && isAudioEnabled.value) playPop()
	},
	{ flush: 'post' },
)

/**
 * Dispatches the inserted url to the RabbitHole service and closes the modal.
 */
const dispatchWebsite = () => {
	if (!insertedURL.value) return
	try {
		new URL(insertedURL.value)
		sendWebsite(insertedURL.value)
		boxUploadURL.value?.toggleModal()
	} catch (_) {
		insertedURL.value = ''
	}
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
	<div
		ref="dropContentZone"
		class="relative flex w-full max-w-screen-lg flex-col justify-center gap-4 self-center overflow-hidden !pt-0 text-sm"
		:class="{
			'pb-16 md:pb-20': !isTwoLines,
			'pb-24 md:pb-28': isTwoLines,
		}">
		<div v-if="isOverDropZone" class="flex h-full w-full grow flex-col items-center justify-center py-4 md:pb-0">
			<div
				class="relative flex w-full grow items-center justify-center rounded-md border-2 border-dashed border-primary p-2 md:p-4">
				<p class="text-lg md:text-xl">
					Drop
					<span class="font-medium text-primary"> files </span>
					to send to the Cheshire Cat, meow!
				</p>
				<button class="btn btn-circle btn-error btn-sm absolute right-2 top-2" @click="isOverDropZone = false">
					<heroicons-x-mark-20-solid class="h-6 w-6" />
				</button>
			</div>
		</div>
		<ErrorBox v-if="!messagesState.ready" :load="messagesState.loading" :error="messagesState.error" />
		<div v-else-if="messagesState.messages.length > 0" class="flex grow flex-col overflow-y-auto">
			<MessageBox
				v-for="msg in messagesState.messages"
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
			<div
				v-for="(msg, index) in randomDefaultMessages"
				:key="index"
				class="btn btn-neutral font-medium normal-case text-base-100 shadow-lg"
				@click="sendMessage(msg)">
				{{ msg }}
			</div>
		</div>
		<div class="fixed bottom-0 left-0 flex w-full items-center justify-center bg-gradient-to-t from-base-200 px-2 py-4">
			<div class="flex w-full max-w-screen-lg items-center gap-2 md:gap-4">
				<div class="relative w-full">
					<textarea
						ref="textArea"
						v-model.trim="userMessage"
						:disabled="inputDisabled"
						autofocus
						class="textarea block max-h-20 w-full resize-none overflow-auto bg-base-200 !outline-offset-0"
						:class="[isTwoLines ? 'pr-10' : 'pr-20']"
						:placeholder="generatePlaceholder(messagesState.loading, isListening, messagesState.error)"
						@keydown="preventSend" />
					<div
						:class="[isTwoLines ? 'flex-col-reverse' : '']"
						class="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
						<button
							:disabled="inputDisabled || userMessage.length === 0"
							class="btn btn-circle btn-ghost btn-sm self-center"
							@click="sendMessage(userMessage)">
							<heroicons-paper-airplane-solid class="h-6 w-6" />
						</button>
						<div class="dropdown dropdown-end dropdown-top self-center">
							<button tabindex="0" :disabled="inputDisabled" class="btn btn-circle btn-ghost btn-sm">
								<heroicons-bolt-solid class="h-6 w-6" />
							</button>
							<ul tabindex="0" class="dropdown-content join join-vertical !-right-1/4 z-10 mb-5 p-0">
								<li>
									<button
										:disabled="rabbitHoleState.loading"
										class="btn join-item w-full flex-nowrap px-2"
										@click="openChatSettings">
										<span class="grow normal-case">Prompt settings</span>
										<span class="rounded-lg bg-primary p-1 text-base-100">
											<heroicons-adjustments-horizontal-solid class="h-6 w-6" />
										</span>
									</button>
								</li>
								<li>
									<button
										:disabled="rabbitHoleState.loading"
										class="btn join-item w-full flex-nowrap px-2"
										@click="openMemory({ multiple: false, accept: AcceptedMemoryTypes.join(',') })">
										<span class="grow normal-case">Upload memories</span>
										<span class="rounded-lg bg-success p-1 text-base-100">
											<ph-brain-fill class="h-6 w-6" />
										</span>
									</button>
								</li>
								<li>
									<button
										:disabled="rabbitHoleState.loading"
										class="btn join-item w-full flex-nowrap px-2"
										@click="boxUploadURL?.toggleModal()">
										<span class="grow normal-case">Upload url</span>
										<span class="rounded-lg bg-info p-1 text-base-100">
											<heroicons-globe-alt class="h-6 w-6" />
										</span>
									</button>
								</li>
								<li>
									<button
										:disabled="rabbitHoleState.loading"
										class="btn join-item w-full flex-nowrap px-2"
										@click="uploadFile()">
										<span class="grow normal-case">Upload file</span>
										<span class="rounded-lg bg-warning p-1 text-base-100">
											<heroicons-document-text-solid class="h-6 w-6" />
										</span>
									</button>
								</li>
								<li>
									<button
										:disabled="messagesState.messages.length === 0"
										class="btn join-item w-full flex-nowrap px-2"
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
				<button
					v-if="isSupported"
					class="btn btn-circle btn-primary"
					:class="[isListening ? 'glass btn-outline' : '']"
					:disabled="inputDisabled"
					@click="toggleListening">
					<heroicons-microphone-solid class="h-6 w-6" />
				</button>
			</div>
			<button
				v-if="isScrollable"
				class="btn btn-circle btn-primary btn-outline btn-sm absolute bottom-28 right-4 bg-base-100"
				@click="scrollToBottom">
				<heroicons-arrow-down-20-solid class="h-5 w-5" />
			</button>
		</div>
		<ModalBox ref="boxUploadURL">
			<div class="flex flex-col items-center justify-center gap-4 text-neutral">
				<h3 class="text-lg font-bold">Insert URL</h3>
				<p>Write down the URL you want the Cat to digest :</p>
				<InputBox v-model.trim="insertedURL" placeholder="Enter url..." />
				<button class="btn btn-primary btn-sm" @click="dispatchWebsite">Send</button>
			</div>
		</ModalBox>
		<SidePanel ref="chatSettingsPanel" title="Prompt Settings">
			<RouterView @close="chatSettingsPanel?.togglePanel()" />
		</SidePanel>
	</div>
</template>
