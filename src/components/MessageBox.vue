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

const isLengthy = computed(() => text.value.length >= maxLength)

const renderedText = computed(() =>
	isLengthy.value ? markdown.render(text.value.slice(0, maxLength)) : markdown.render(text.value),
)
</script>

<template>
	<div class="chat my-2 gap-x-3" :class="[sender === 'bot' ? 'chat-start' : 'chat-end']">
		<div class="chat-image row-[1] text-lg">
			{{ sender === 'bot' ? '😺' : '🙂' }}
		</div>
		<div class="chat-bubble row-[1] flex min-h-fit items-center break-words rounded-lg bg-base-100 p-0 text-neutral">
			<div class="p-2 md:p-3">
				<p class="text-ellipsis" v-html="renderedText" />
				<div v-if="isLengthy" class="flex justify-end font-bold">
					<a v-if="showReadMore" @click="showReadMore = false">Read more</a>
					<a v-else @click="showReadMore = true">Hide content</a>
				</div>
			</div>
			<div v-if="why" class="divider divider-horizontal m-0 w-px before:bg-base-200 after:bg-base-200" />
			<button v-if="why" class="btn btn-circle btn-primary btn-xs mx-2" @click="whyPanel?.togglePanel()">
				<p class="text-base">?</p>
			</button>
		</div>
		<SidePanel v-if="why" ref="whyPanel" title="Why this response">
			<div class="flex flex-col gap-4">
				<div class="overflow-x-auto rounded-md border-2 border-neutral">
					<table class="table table-zebra table-sm text-center">
						<thead class="bg-base-100 text-neutral">
							<th>🧰 Tool</th>
							<th>⌨️ Input</th>
							<th>💬 Output</th>
						</thead>
						<tbody v-if="why.intermediate_steps?.length > 0">
							<tr v-for="data in why.intermediate_steps" :key="data[0]">
								<td>{{ data[0][0] }}</td>
								<td>{{ data[0][1] }}</td>
								<td>{{ data[1] }}</td>
							</tr>
						</tbody>
						<tbody v-else>
							<tr class="font-medium">
								<td />
								<td>No tools were used.</td>
								<td />
							</tr>
						</tbody>
					</table>
				</div>
				<MemorySelect :result="why.memory" />
			</div>
		</SidePanel>
	</div>
</template>
