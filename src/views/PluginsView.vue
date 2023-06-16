<script setup lang="ts">
import _ from 'lodash'
import type { Plugin } from '@models/Plugin'
import { usePlugins } from '@stores/usePlugins'

const store = usePlugins()
const { togglePlugin } = store
const { currentState: pluginsState } = storeToRefs(store)

const searchText = ref("")
const pluginsList = ref<Plugin[]>([])

watchDeep(pluginsState, () => {
	pluginsList.value = _.cloneDeep(pluginsState.value.data ?? [])
})

const searchPlugin = () => {
	pluginsList.value = pluginsList.value.filter(p => p.name.includes(searchText.value))
}
</script>

<template>
	<div class="flex w-full flex-col gap-8 self-center md:w-3/4">
		<div class="col-span-2 flex flex-col items-center justify-center gap-3 rounded-md p-6">
			<p class="text-3xl font-bold text-primary">
				Plugins
			</p>
			<p class="text-center font-medium">
				This page displays the list of active plugins on the <strong>Cheshire Cat</strong>.
				In the next version of the project, users will be able to activate or disable individual plugins according to their needs,
				allowing for greater customization of the user experience.
			</p>
		</div>
		<div class="form-control w-full">
			<label class="label">
				<span class="label-text font-medium text-primary">Search for a plugin</span>
			</label>
			<div class="relative w-full">
				<input v-model.trim="searchText" type="text" placeholder="Enter a plugin name..."
					class="input-primary input input-sm w-full" @keyup.enter="searchPlugin()">
				<button class="btn-primary btn-square btn-sm btn absolute right-0 top-0" @click="searchPlugin()">
					<heroicons-magnifying-glass-20-solid class="h-5 w-5" />
				</button>
			</div>
		</div>
		<div class="flex flex-wrap items-end justify-between gap-2">
			<p class="font-medium">
				Installed plugins: {{ pluginsState.data?.length ?? 0 }}
			</p>
			<button disabled class="btn-primary btn-sm btn">
				Upload plugin (coming soon)
			</button>
		</div>
		<div v-if="pluginsState.loading" class="flex grow items-center justify-center">
			<span class="loading loading-spinner w-12 text-primary" />
		</div>
		<div v-else-if="pluginsState.error" class="flex grow items-center justify-center">
			<div class="rounded-md bg-error p-4 font-bold text-base-100 shadow-xl">
				Failed to fetch installed plugins
			</div>
		</div>
		<div v-else class="flex flex-col gap-4">
			<div v-for="item in pluginsList" :key="item.id" class="flex gap-4 rounded-lg bg-base-200 p-4">
				<div class="placeholder avatar self-center">
					<div class="h-16 w-16 rounded-md bg-gradient-to-b from-blue-500 to-primary text-base-100">
						<span class="text-4xl font-bold leading-3">{{ _.upperFirst(item.name)[0] }}</span>
					</div>
				</div>
				<div class="flex grow flex-col">
					<p class="flex flex-wrap justify-between text-xl font-bold">
						<span>{{ item.name }}</span>
						<input v-if="item.id !== 'core_plugin'" type="checkbox" disabled
							class="!toggle-success !toggle" @click="togglePlugin(item.id)">
					</p>
					<p class="text-sm">
						{{ item.description }}
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
