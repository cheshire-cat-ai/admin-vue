<script setup lang="ts">
import SidePanel from '@components/SidePanel.vue'
import { useSettings } from '@stores/useSettings'

const store = useSettings()
const { mustSummarize, isAudioEnabled } = storeToRefs(store)

const { t } = useI18n()

const panelTitles = {
	'embedder': t('settings.embedder.panel'),
	'llm': t('settings.llm.panel')
} as const

const sidePanel = ref<InstanceType<typeof SidePanel>>()
const panelTitle = ref<string>('')

const openSidePanel = (title: keyof typeof panelTitles) => {
	panelTitle.value = panelTitles[title]
	sidePanel.value?.togglePanel()
}
</script>

<template>
	<div class="grid auto-rows-min gap-8 self-center md:w-3/4 md:grid-cols-2">
		<div class="col-span-2 flex flex-col items-center justify-center gap-2 rounded-md p-4">
			<p class="text-3xl font-bold text-primary">
				{{ $t('settings.title') }}
			</p>
			<p class="font-medium">
				{{ $t('settings.desc') }}
			</p>
		</div>
		<div class="col-span-2 flex flex-col items-center justify-between gap-8 rounded-lg bg-base-100 p-4 md:col-span-1">
			<p class="text-xl font-bold">
				{{ $t('settings.llm.title') }}
			</p>
			<p class="text-center">
				{{ $t('settings.llm.desc') }}
			</p>
			<RouterLink :to="{ name: 'providers' }" class="btn btn-primary btn-sm"
				@click="openSidePanel('llm')">
				{{ $t('settings.configure') }}
			</RouterLink>
		</div>
		<div class="col-span-2 flex flex-col items-center justify-between gap-8 rounded-lg bg-base-100 p-4 md:col-span-1">
			<p class="text-xl font-bold">
				{{ $t('settings.embedder.title') }}
			</p>
			<p class="text-center">
				{{ $t('settings.embedder.desc') }}
			</p>
			<RouterLink :to="{ name: 'embedders' }" class="btn btn-primary btn-sm"
				@click="openSidePanel('embedder')">
				{{ $t('settings.configure') }}
			</RouterLink>
		</div>
		<div class="col-span-2 flex flex-col items-center justify-between gap-4 rounded-lg bg-base-100 p-4">
			<p class="text-xl font-bold">
				General Settings
			</p>
			<div class="flex w-full justify-between gap-2 rounded-lg bg-base-200 p-4">
				<p class="flex items-center justify-center gap-2">
					<heroicons-speaker-wave-solid class="h-5 w-5 text-primary" />
					<span>Toggle sounds on messages</span>
				</p>
				<input v-model="isAudioEnabled" type="checkbox" class="!toggle !toggle-success">
			</div>
			<div class="flex w-full justify-between gap-2 rounded-lg bg-base-200 p-4">
				<p class="flex items-center justify-center gap-2">
					<ph-text-align-left-bold class="h-5 w-5 text-primary" />
					<span>Toggle the summarization when uploading documents or urls</span>
				</p>
				<input v-model="mustSummarize" type="checkbox" class="!toggle !toggle-success">
			</div>
		</div>
		<SidePanel ref="sidePanel" :title="panelTitle">
			<RouterView @close="sidePanel?.togglePanel()" />
		</SidePanel>
	</div>
</template>
