<script setup lang="ts">
import SidePanel from '@components/SidePanel.vue'

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
		<div class="col-span-2 flex flex-col items-center gap-4 place-self-center rounded-lg bg-base-200 p-4">
			<p class="text-base font-medium md:text-lg">
				{{ $t('settings.lang') }}
			</p>
			<LocaleChanger />
		</div>
		<div class="col-span-2 flex flex-col items-center justify-between gap-8 rounded-lg bg-base-200 p-4 md:col-span-1">
			<p class="text-2xl font-bold">
				{{ $t('settings.llm.title') }}
			</p>
			<p class="text-center">
				{{ $t('settings.llm.desc') }}
			</p>
			<RouterLink :to="{ name: 'providers' }" class="btn-primary btn-sm btn text-base-100"
				@click="openSidePanel('llm')">
				{{ $t('settings.configure') }}
			</RouterLink>
		</div>
		<div class="col-span-2 flex flex-col items-center justify-between gap-8 rounded-lg bg-base-200 p-4 md:col-span-1">
			<p class="text-2xl font-bold">
				{{ $t('settings.embedder.title') }}
			</p>
			<p class="text-center">
				{{ $t('settings.embedder.desc') }}
			</p>
			<RouterLink :to="{ name: 'embedders' }" class="btn-primary btn-sm btn text-base-100"
				@click="openSidePanel('embedder')">
				{{ $t('settings.configure') }}
			</RouterLink>
		</div>
		<SidePanel ref="sidePanel" :title="panelTitle">
			<RouterView @close="sidePanel?.togglePanel()" />
		</SidePanel>
	</div>
</template>
