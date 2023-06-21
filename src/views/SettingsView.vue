<script setup lang="ts">
import SidePanel from '@components/SidePanel.vue'

const panelTitles = [ 'Configure the Language Model', 'Configure the Embedder' ] as const

const sidePanel = ref<InstanceType<typeof SidePanel>>()
const panelTitle = ref<string>('')

const openSidePanel = (title: typeof panelTitles[number]) => {
	panelTitle.value = title
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
				Configure your Cheshire Cat to suit your needs
			</p>
		</div>
		<div class="col-span-2 flex flex-col items-center gap-4 place-self-center rounded-lg bg-base-200 p-4">
			<p class="text-base font-medium md:text-lg">
				Change language
			</p>
			<LocaleChanger />
		</div>
		<div class="col-span-2 flex flex-col items-center justify-between gap-8 rounded-lg bg-base-200 p-4 md:col-span-1">
			<p class="text-2xl font-bold">
				Language Model
			</p>
			<p class="text-center">
				Choose and configure your favourite Large Language Model
			</p>
			<RouterLink :to="{ name: 'providers' }" class="btn-primary btn-sm btn text-base-100"
				@click="openSidePanel('Configure the Language Model')">
				Configure
			</RouterLink>
		</div>
		<div class="col-span-2 flex flex-col items-center justify-between gap-8 rounded-lg bg-base-200 p-4 md:col-span-1">
			<p class="text-2xl font-bold">
				Embedder
			</p>
			<p class="text-center">
				Choose a language embedder to help the Cat remember conversations and documents
			</p>
			<RouterLink :to="{ name: 'embedders' }" class="btn-primary btn-sm btn text-base-100"
				@click="openSidePanel('Configure the Embedder')">
				Configure
			</RouterLink>
		</div>
		<SidePanel ref="sidePanel" :title="panelTitle">
			<RouterView @close="sidePanel?.togglePanel()" />
		</SidePanel>
	</div>
</template>
