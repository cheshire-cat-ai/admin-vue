<script setup lang="ts">
import { useRabbitHole } from '@stores/useRabbitHole'
import { useMessages } from '@stores/useMessages'
import { useMemory } from '@stores/useMemory'
import ModalBox from '@components/ModalBox.vue'
import { capitalize } from 'lodash'

const route = useRoute()
const messagesStore = useMessages()
const { dispatchMessage, selectRandomDefaultMessages } = messagesStore
const { currentState: messagesState } = storeToRefs(messagesStore)

const userMessage = ref(''),
	insertedURL = ref(''),
	isScrollable = ref(false),
	isTwoLines = ref(false)
const boxUploadURL = ref<InstanceType<typeof ModalBox>>()

const { textarea: textArea } = useTextareaAutosize({
	input: userMessage,
	onResize: () => {
		if (textArea.value) {
			isTwoLines.value = textArea.value.clientHeight >= 72
		}
	},
})

const { isListening, toggle: toggleRecording, result: transcript } = useSpeechRecognition()
const { state: micState, isSupported, query: queryMic } = usePermission('microphone', { controls: true })

const { currentState: rabbitHoleState } = storeToRefs(useRabbitHole())

const { wipeConversation } = useMemory()

const inputDisabled = computed(() => {
	return messagesState.value.loading || !messagesState.value.ready || Boolean(messagesState.value.error)
})

const randomDefaultMessages = selectRandomDefaultMessages()

const dropContentZone = ref<HTMLDivElement>()

const { download: downloadConversation } = downloadContent('Cat_Conversation')
const { upload: uploadFile } = uploadContent()

/**
 * Calls the specific endpoints based on the mime type of the file
 */
const contentHandler = async (content: string | File[] | null) => {
	if (!content) return
	if (typeof content === 'string') {
		if (content.trim().length == 0) return
		try {
			new URL(content)
			uploadFile('web', content)
		} catch (_) {
			dispatchMessage(content)
		}
	} else content.forEach(f => uploadFile('content', f))
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
 * When the user stops recording, the transcript will be sent to the messages service.
 */
watchEffect(() => {
	if (transcript.value === '') return
	userMessage.value = transcript.value
})

/**
 * Toggle recording and plays an audio if enabled
 */
const toggleListening = async () => {
	if (micState.value !== 'granted') {
		const permState = await queryMic()
		if (permState?.state !== 'granted') return
	}
	toggleRecording()
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
		textArea.value.focus()
	},
	{ flush: 'post' },
)

onActivated(() => {
	textArea.value.focus()
})

/**
 * Dispatches the inserted url to the RabbitHole service and closes the modal.
 */
const dispatchWebsite = () => {
	if (!insertedURL.value) return
	try {
		new URL(insertedURL.value)
		uploadFile('web', insertedURL.value)
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

const generatePlaceholder = (isLoading: boolean, isRecording: boolean, error?: string) => {
	if (error) return 'Well, well, well, looks like something has gone amiss'
	if (isLoading) return 'The enigmatic Cheshire cat is pondering...'
	if (isRecording) return 'The curious Cheshire cat is all ears...'
	return 'Ask the Cheshire Cat...'
}

const wipeHistory = async () => {
	const res = await wipeConversation()
	if (res) messagesState.value.messages = []
}

const scrollToBottom = () => {
	if (route.path === '/') window.scrollTo({ behavior: 'smooth', left: 0, top: document.body.scrollHeight })
}
</script>

<template>
	<div
		ref="dropContentZone"
		class="relative flex w-full max-w-screen-lg flex-col justify-center gap-4 self-center overflow-hidden !pt-0 text-sm"
		:class="{
			'pb-16 md:pb-20': !isTwoLines,
			'pb-24 md:pb-28': isTwoLines,
		}">
		<div v-if="isOverDropZone" class="flex size-full grow flex-col items-center justify-center py-4 md:pb-0">
			<div class="relative flex w-full grow items-center justify-center rounded-md border-2 border-dashed border-primary p-2 md:p-4">
				<p class="text-lg md:text-xl">
					Drop
					<span class="font-medium text-primary"> files </span>
					to send to the Cheshire Cat, meow!
				</p>
				<button class="btn btn-circle btn-error btn-sm absolute right-2 top-2" @click="isOverDropZone = false">
					<heroicons-x-mark-20-solid class="size-6" />
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
				:file="msg.sender === 'user' ? msg.file : undefined"
				:why="msg.sender === 'bot' ? msg.why : ''" />
			<p v-if="messagesState.error" class="w-fit rounded-md bg-error p-4 font-semibold text-base-100">
				{{ messagesState.error }}
			</p>
			<div v-else-if="messagesState.tokens.length > 0" class="mb-2 ml-2 flex items-center gap-2">
				<span class="text-lg">😺</span>
				<p class="flex max-w-[80%] items-center gap-2 text-base-content">
					<span class="loading loading-dots loading-xs shrink-0" />
					{{ messagesState.tokens.join('') }}
				</p>
			</div>
			<div v-else-if="!messagesState.error && messagesState.loading" class="mb-2 ml-2 flex items-center gap-2">
				<span class="text-lg">😺</span>
				<p class="flex items-center gap-2">
					<span class="loading loading-dots loading-xs shrink-0" />
					Cheshire cat is thinking...
				</p>
			</div>
		</div>
		<div v-else class="flex grow cursor-pointer flex-col items-center justify-center gap-4 p-4">
			<div
				v-for="(msg, index) in randomDefaultMessages"
				:key="index"
				class="btn btn-neutral font-medium text-base-100 shadow-lg"
				@click="sendMessage(msg)">
				{{ msg }}
			</div>
		</div>
		<div class="fixed bottom-0 left-0 flex w-full items-center justify-center bg-gradient-to-t from-base-200 px-2 py-4">
			<div class="flex w-full max-w-screen-lg items-center gap-2 md:gap-4">
				<div class="dropdown dropdown-top">
					<button tabindex="0" :disabled="inputDisabled" class="btn btn-circle btn-primary shadow-lg">
						<heroicons-bolt-solid class="size-5" />
					</button>
					<ul tabindex="0" class="dropdown-content join join-vertical !left-0 z-10 mb-6 w-48 p-0 [&>li>*]:bg-base-100">
						<li>
							<button
								:disabled="messagesState.messages.length === 0"
								class="btn join-item w-full flex-nowrap px-2 text-left font-medium"
								@click="downloadConversation(messagesState.messages.reduce((p, c) => `${p}${capitalize(c.sender)}: ${c.text}\n`, ''))">
								<span class="rounded-lg p-1 text-primary">
									<ph-export-bold class="size-5" />
								</span>
								<span class="grow">Export conversation</span>
							</button>
						</li>
						<li>
							<button
								:disabled="rabbitHoleState.loading"
								class="btn join-item w-full flex-nowrap px-2 text-left font-medium"
								@click="uploadFile('memory')">
								<span class="rounded-lg p-1 text-success">
									<ph-brain-fill class="size-5" />
								</span>
								<span class="grow">Upload memories</span>
							</button>
						</li>
						<li>
							<button
								:disabled="rabbitHoleState.loading"
								class="btn join-item w-full flex-nowrap px-2 text-left font-medium"
								@click="boxUploadURL?.toggleModal()">
								<span class="rounded-lg p-1 text-info">
									<heroicons-globe-alt class="size-5" />
								</span>
								<span class="grow">Upload url</span>
							</button>
						</li>
						<li>
							<button
								:disabled="rabbitHoleState.loading"
								class="btn join-item w-full flex-nowrap px-2 text-left font-medium"
								@click="uploadFile('content')">
								<span class="rounded-lg p-1 text-warning">
									<heroicons-document-text-solid class="size-5" />
								</span>
								<span class="grow">Upload file</span>
							</button>
						</li>
						<li>
							<button class="btn join-item w-full flex-nowrap px-2 text-left font-medium" @click="wipeHistory()">
								<span class="rounded-lg p-1 text-error">
									<heroicons-trash-solid class="size-5" />
								</span>
								<span class="grow">Clear conversation</span>
							</button>
						</li>
					</ul>
				</div>
				<div class="relative w-full">
					<textarea
						ref="textArea"
						v-model.trim="userMessage"
						:disabled="inputDisabled"
						autofocus
						:class="'textarea block max-h-20 w-full resize-none overflow-auto bg-base-200 pr-10 !outline-2 shadow-lg !outline-offset-0'"
						:placeholder="generatePlaceholder(messagesState.loading, isListening, messagesState.error)"
						@keydown="preventSend" />
					<div class="absolute right-2 top-1/2 -translate-y-1/2">
						<button
							:disabled="inputDisabled || userMessage.length === 0"
							class="btn btn-circle btn-ghost btn-sm self-center"
							@click="sendMessage(userMessage)">
							<heroicons-paper-airplane-solid class="size-6" />
						</button>
					</div>
				</div>
				<button
					v-if="isSupported"
					class="btn btn-circle btn-primary shadow-lg"
					:class="[isListening ? 'glass btn-outline' : '']"
					:disabled="inputDisabled"
					@click="toggleListening">
					<heroicons-microphone-solid class="size-6" />
				</button>
			</div>
			<button
				v-if="isScrollable"
				class="btn btn-circle btn-outline btn-primary btn-sm absolute bottom-28 right-4 bg-base-100"
				@click="scrollToBottom">
				<heroicons-arrow-down-20-solid class="size-5" />
			</button>
		</div>
		<Teleport to="#modal">
			<ModalBox ref="boxUploadURL">
				<div class="flex flex-col items-center justify-center gap-4 text-neutral">
					<h3 class="text-lg font-bold">Insert URL</h3>
					<p>Write down the URL you want the Cat to digest :</p>
					<InputBox v-model.trim="insertedURL" placeholder="Enter url..." />
					<button class="btn btn-primary btn-sm" @click="dispatchWebsite">Send</button>
				</div>
			</ModalBox>
		</Teleport>
	</div>
</template>
