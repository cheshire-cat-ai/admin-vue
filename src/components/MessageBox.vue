<script setup lang="ts">
import hljs from 'highlight.js'
import { Remarkable } from 'remarkable'
import { linkify } from 'remarkable/linkify'
import 'highlight.js/styles/github.css'
import SidePanel from '@components/SidePanel.vue'

const whyPanel = ref<InstanceType<typeof SidePanel>>()

const markdown = new Remarkable({
	html: true,
	breaks: true,
	xhtmlOut: true,
	typographer: true,
	highlight: (str, lang) => {
		if (lang && hljs.getLanguage(lang)) {
			try { return hljs.highlight(str, { language: lang }).value }
			catch (_) { console.log(_) }
		}
		try { return hljs.highlightAuto(str).value }
		catch (_) { console.log(_) }
		return '' // use external default escaping
	}
}).use(linkify)

markdown.inline.ruler.enable(['sup', 'sub'])
markdown.core.ruler.enable(['abbr'])
markdown.block.ruler.enable(['footnote', 'deflist'])

const props = defineProps<{
	sender: 'bot' | 'user',
	text: string,
	why: any
}>()

const cleanedText = props.text.replace(/"(.+)"/gm, '$1')
</script>

<template>
	<div class="chat gap-x-3" :class="[sender === 'bot' ? 'chat-start' : 'chat-end']">
		<div class="chat-image px-2 text-lg">
			{{ sender === 'bot' ? '😺' : '🙂' }}
		</div>
		<div class="chat-bubble m-2 min-h-fit break-words rounded-lg p-2 md:p-4" :class="{ '!pr-10': why }">
			<p v-html="markdown.render(cleanedText)" />
			<button v-if="why" class="btn-primary btn-square btn-xs btn absolute right-1 top-1 m-1 !p-0"
				@click="whyPanel?.togglePanel()">
				<p class="text-base text-neutral">
					?
				</p>
			</button>
		</div>
		<SidePanel ref="whyPanel" title="Why this response">
			<div v-if="why" class="flex flex-col gap-4">
				<div class="overflow-x-auto rounded-md border-2 border-neutral">
					<table class="table-zebra table-sm table text-center">
						<thead class="bg-base-200 text-neutral">
							<th>🧰 Tool</th>
							<th>⌨️ Input</th>
							<th>💬 Output</th>
						</thead>
						<tbody v-if="why.intermediate_steps.length > 0">
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

<style lang="scss" scoped>
.chat-bubble > p a {
	@apply link link-info;
}

.chat-bubble > p pre {
	@apply my-4 whitespace-pre-wrap;
}

.chat-bubble > p ul {
	@apply list-disc list-inside;
}

.chat-bubble > p ol {
	@apply list-decimal list-inside;
}

.chat-bubble > p table {
	@apply table table-xs;
}
</style>
