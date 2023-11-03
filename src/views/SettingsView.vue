<script setup lang="ts">
import SidePanel from '@components/SidePanel.vue'
import { useSettings } from '@stores/useSettings'

const { cat } = storeToRefs(useSettings())

const panelTitles = {
	embedder: 'Configure the Embedder',
	llm: 'Configure the Language Model',
} as const

const sidePanel = ref<InstanceType<typeof SidePanel>>()
const panelTitle = ref<string>('')

const openSidePanel = (title: keyof typeof panelTitles) => {
	panelTitle.value = panelTitles[title]
	sidePanel.value?.togglePanel()
}
</script>

<template>
	<div class="grid w-full auto-rows-min gap-8 self-center md:w-3/4 md:grid-cols-2">
		<div class="col-span-2 flex flex-col items-center justify-center gap-2 rounded-md p-4">
			<p class="text-lg font-bold">
				Cheshire Cat AI - Version
				<span class="text-primary">
					{{ cat?.version ?? 'unknown' }}
				</span>
			</p>
		</div>
		<div class="col-span-2 flex flex-col items-center justify-between gap-8 rounded-lg bg-base-100 p-4 md:col-span-1 shadow-md">
			<p class="text-xl font-bold">Large Language Model</p>
			<p class="text-center">Choose and configure your favourite LLM from a list of supported providers</p>
			<RouterLink :to="{ name: 'providers' }" class="btn btn-primary btn-sm" @click="openSidePanel('llm')">
				Configure
			</RouterLink>
		</div>
		<div class="col-span-2 flex flex-col items-center justify-between gap-8 rounded-lg bg-base-100 p-4 md:col-span-1 shadow-md">
			<p class="text-xl font-bold">Embedder</p>
			<p class="text-center">Choose a language embedder to help the Cat remember conversations and documents</p>
			<RouterLink :to="{ name: 'embedders' }" class="btn btn-primary btn-sm" @click="openSidePanel('embedder')">
				Configure
			</RouterLink>
		</div>
		<!--<div class="col-span-2 flex flex-col items-center justify-between gap-4 rounded-lg bg-base-100 p-4">
			<p class="text-xl font-bold">General Settings</p>
			<div class="flex w-full items-center justify-between gap-2 rounded-lg bg-base-200 p-4">
				<p class="flex items-center justify-center gap-2">
					<heroicons-speaker-wave-solid class="h-5 w-5 shrink-0 text-primary" />
					<span>Toggle sounds on messages</span>
				</p>
				<input v-model="isAudioEnabled" type="checkbox" class="!toggle !toggle-primary" />
			</div>
		</div>-->
		<SidePanel ref="sidePanel" :title="panelTitle">
			<RouterView @close="sidePanel?.togglePanel()" />
		</SidePanel>
	</div>
</template>
