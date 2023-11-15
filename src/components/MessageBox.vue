<script setup lang="ts">
import hljs from 'highlight.js'
import { Remarkable } from 'remarkable'
import { linkify } from 'remarkable/linkify'
import SidePanel from '@components/SidePanel.vue'

const whyPanel = ref<InstanceType<typeof SidePanel>>()

const markdown = new Remarkable({
	html: true,
	breaks: true,
	xhtmlOut: true,
	typographer: true,
	highlight: (str, lang) => {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(str, { language: lang }).value
			} catch (_) {
				console.log(_)
			}
		}
		try {
			return hljs.highlightAuto(str).value
		} catch (_) {
			console.log(_)
		}
		return '' // use external default escaping
	},
}).use(linkify)

markdown.inline.ruler.enable(['sup', 'sub'])
markdown.core.ruler.enable(['abbr'])
markdown.block.ruler.enable(['footnote', 'deflist'])

const props = defineProps<{
	sender: 'bot' | 'user'
	text: string
	why: any
}>()

const { text } = toRefs(props)

const showReadMore = ref(true)

const maxLength = 3000

const isUserSender = computed(() => props.sender === 'user')
const isLengthy = computed(() => text.value.length > maxLength && isUserSender.value)

const renderedText = computed(() => {
	if (isLengthy.value && showReadMore.value) {
		return markdown.render(text.value)
	} else if (isLengthy.value) {
		return markdown.render(text.value.slice(0, maxLength))
	} else {
		return markdown.render(text.value)
	}
})

</script>

<template>
	<div class="chat my-2 gap-x-3" :class="[sender === 'bot' ? 'chat-start' : 'chat-end']">
		<div class="chat-image row-[1] text-lg">
			{{ sender === 'bot' ? '😺' : '🙂' }}
		</div>
		<div class="chat-bubble row-[1] flex min-h-fit items-center break-words rounded-lg bg-base-100 p-0 text-neutral shadow-md">
			<div class="p-2 md:p-3">
				<p class="text-ellipsis" v-html="renderedText" />
				<div v-if="isLengthy && !showReadMore" class="flex justify-end font-bold">
					<a @click="showReadMore = true">Read more</a>
				</div>
				<div v-else-if="isLengthy && showReadMore" class="flex justify-end font-bold">
					<a @click="showReadMore = false">Hide content</a>
				</div>
			</div>
			<div v-if="why" class="divider divider-horizontal m-0 w-px before:bg-base-200 after:bg-base-200" />
			<button v-if="why" class="btn btn-circle btn-xs mx-2 border-0 bg-neutral/20 text-neutral" @click="whyPanel?.togglePanel()">
				<p class="text-base">?</p>
			</button>
		</div>
		<SidePanel v-if="why" ref="whyPanel" title="Why this response">
			<div class="flex flex-col gap-4">
				<div v-if="why.intermediate_steps?.length > 0" class="overflow-x-auto rounded bg-base-100 shadow">
					<div v-for="data in why.intermediate_steps" :key="data[0]">
						<div class="grid grid-cols-2 grid-rows-1 pt-2">
							<div class="px-3 py-2">
								<h2 class="flex items-center justify-center gap-2 pb-1 text-sm font-bold"><ph-nut class="h-5 w-5" />Triggered Tool</h2>
								<p class="mx-1 my-2 flex items-center justify-center rounded bg-base-200/50 px-4 py-2 text-sm">{{ data[0][0] }}</p>
							</div>
							<div class="px-3 py-2">
								<h2 class="flex items-center justify-center gap-2 pb-1 text-sm font-bold"><ph-textbox class="h-5 w-5" />Tool Input</h2>
								<p class="mx-1 my-2 flex items-center justify-center rounded bg-base-200/50 px-4 py-2 text-sm">{{ data[0][1] }}</p>
							</div>
						</div>
						<div class="px-3 py-2">
							<h2 class="flex items-center justify-center gap-2 pb-1 text-sm font-bold">
								<ph-chat-centered-dots class="h-5 w-5" />Tool Output
							</h2>
							<p class="mx-1 my-2 rounded bg-base-200/50 p-4 text-sm">{{ data[1] }}</p>
						</div>
					</div>
				</div>
				<MemorySelect :result="why.memory" />
			</div>
		</SidePanel>
	</div>
</template>
