<script setup lang="ts">
import md from '@utils/markdown'
import SidePanel from '@components/SidePanel.vue'

const whyPanel = ref<InstanceType<typeof SidePanel>>()

const props = defineProps<{
	sender: 'bot' | 'user'
	text: string
	file?: File
	why?: Record<string, any>
	when: Date
}>()

defineEmits<{
	regenerate: []
}>()

const { text, sender, file, when } = toRefs(props)

const showReadMore = ref(true)

const maxLength = 3000

const isLengthy = computed(() => text.value.length > maxLength && sender.value === 'user')
const renderedText = computed(() => {
	return isLengthy.value && !showReadMore.value ? md.render(text.value.slice(0, maxLength)) : md.render(text.value)
})

const { copy } = useClipboard({ source: text })

const timestamp = computed(() => {
	const current = new Date()
	const old = when.value
	const isSameDay =
		current.getFullYear() === old.getFullYear() && current.getMonth() === old.getMonth() && current.getDate() === old.getDate()
	const time = useDateFormat(when, 'DD/MM/YYYY HH:mm').value
	if (isSameDay) return time.split(' ')[1]
	return time
})

const fileTypeSize = computed(() => {
	if (!file?.value) return ''
	const size = file.value.size
	const type = file.value.name.substring(file.value.name.lastIndexOf('.') + 1).toUpperCase()
	if (size < 1000) return `${type} | ${size} B`
	if (size < 1000000) return `${type} | ${(size / 1000).toFixed(2)} KB`
	if (size < 1000000000) return `${type} | ${(size / 1000000).toFixed(2)} MB`
	return `${type} | ${(size / 1000000000).toFixed(2)} GB`
})

const fileUrl = computed(() => {
	if (!file?.value) return ''
	return URL.createObjectURL(file.value)
})
</script>

<template>
	<div class="chat gap-x-3" :class="[sender === 'bot' ? 'chat-start' : 'chat-end']">
		<div class="chat-image text-lg">
			{{ sender === 'bot' ? '😺' : '🙂' }}
		</div>
		<div class="chat-header">
			{{ sender === 'bot' ? 'Cheshire Cat' : 'You' }}
			<time class="text-xs opacity-50">{{ timestamp }}</time>
		</div>
		<div class="chat-bubble flex min-h-fit w-fit flex-col break-words rounded-lg bg-base-100 p-2 text-neutral shadow-md md:p-3">
			<div v-if="text" class="text-ellipsis" v-html="renderedText" />
			<p v-else class="text-ellipsis font-medium italic opacity-75">Cheshire Cat is thinking...</p>
			<div v-if="isLengthy" class="flex justify-end font-bold">
				<a v-if="showReadMore" @click="showReadMore = false">Hide content</a>
				<a v-else @click="showReadMore = true">Read more</a>
			</div>
			<img v-if="file?.type.startsWith('image/')" :src="fileUrl" width="512" height="512" class="rounded-lg shadow-xl" />
			<audio
				v-else-if="file?.type.startsWith('audio/')"
				:src="fileUrl"
				controls
				:type="file.type"
				controlslist="nodownload noplaybackrate" />
			<video v-else-if="file?.type.startsWith('video/')" controls disablepictureinpicture controlslist="nodownload noplaybackrate">
				<source :src="fileUrl" :type="file.type" />
				<p>
					Your browser doesn't support HTML video. Here is a
					<a :href="fileUrl">link to the video</a> instead.
				</p>
			</video>
			<div v-else-if="file" class="flex items-center justify-center gap-2 rounded-lg bg-base-200 p-2 shadow-xl">
				<ph-file-fill class="size-6" />
				<div class="flex flex-col gap-1">
					<p class="font-bold">{{ file.name.substring(0, file.name.lastIndexOf('.')) }}</p>
					<p class="text-xs">{{ fileTypeSize }}</p>
				</div>
			</div>
		</div>
		<div v-if="sender === 'bot'" class="chat-footer mt-1 flex gap-1">
			<div class="tooltip tooltip-bottom" data-tip="Copy">
				<button class="btn btn-square btn-ghost btn-xs" @click="copy()"><heroicons-clipboard class="size-4" /></button>
			</div>
			<div class="tooltip tooltip-bottom" data-tip="Regenerate">
				<button class="btn btn-square btn-ghost btn-xs" @click="$emit('regenerate')"><heroicons-arrow-path class="size-4" /></button>
			</div>
			<div v-if="why" class="tooltip tooltip-bottom" data-tip="Why this response">
				<button class="btn btn-square btn-outline btn-primary btn-xs" @click="whyPanel?.togglePanel()">
					<ph-question-mark class="size-4" />
				</button>
			</div>
		</div>
		<SidePanel v-if="why" ref="whyPanel" title="Why this response">
			<div class="flex flex-col gap-4">
				<div v-if="why.intermediate_steps?.length > 0" class="overflow-x-auto rounded bg-base-100 shadow">
					<div v-for="data in why.intermediate_steps" :key="data[0]">
						<div class="grid grid-cols-2 grid-rows-1 pt-2">
							<div class="px-3 py-2">
								<h2 class="flex items-center justify-center gap-2 pb-1 text-sm font-bold"><ph-nut class="size-5" />Triggered Tool</h2>
								<p class="mx-1 my-2 flex items-center justify-center rounded bg-base-200 px-4 py-2 text-sm">{{ data[0][0] }}</p>
							</div>
							<div class="px-3 py-2">
								<h2 class="flex items-center justify-center gap-2 pb-1 text-sm font-bold"><ph-textbox class="size-5" />Tool Input</h2>
								<p class="mx-1 my-2 flex items-center justify-center rounded bg-base-200 px-4 py-2 text-sm">{{ data[0][1] }}</p>
							</div>
						</div>
						<div class="px-3 py-2">
							<h2 class="flex items-center justify-center gap-2 pb-1 text-sm font-bold">
								<ph-chat-centered-dots class="size-5" />Tool Output
							</h2>
							<p class="mx-1 my-2 rounded bg-base-200 p-4 text-sm">{{ data[1] }}</p>
						</div>
					</div>
				</div>
				<MemorySelect :result="why.memory" />
			</div>
		</SidePanel>
	</div>
</template>
