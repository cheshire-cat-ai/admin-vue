<script setup lang="ts">
import _ from 'lodash'
import type { Plugin } from '@models/Plugin'
import { usePlugins } from '@stores/usePlugins'
import { useSettings } from '@stores/useSettings'

const store = usePlugins()
const { togglePlugin } = store
const { currentState: pluginsState } = storeToRefs(store)

const { currentFilters } = storeToRefs(useSettings())

const searchText = ref("")
const pluginsList = ref<Plugin[]>([])

watchDeep(pluginsState, () => {
	pluginsList.value = [...new Set([
		...pluginsState.value.data?.installed ?? [],
		...pluginsState.value.data?.registry ?? []
	])]
})

const searchPlugin = () => {
	pluginsList.value = pluginsList.value.filter(p => p.name.includes(searchText.value))
}

const filteredList = computed(() => {
	const toFilterList = _.cloneDeep(pluginsList.value)
	return toFilterList
})
</script>

<template>
	<div class="flex w-full flex-col gap-8 self-center md:w-3/4">
		<div class="col-span-2 flex flex-col items-center justify-center gap-2 rounded-md p-4">
			<p class="text-3xl font-bold text-primary">
				Plugins
			</p>
			<p class="text-center font-medium">
				This page displays the list of active plugins on the <strong>Cheshire Cat</strong>.
				In the next version of the project, users will be able to activate or disable individual plugins according to their needs,
				allowing for greater customization of the user experience.
			</p>
		</div>
		<div class="flex flex-col gap-4">
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
			<div class="flex flex-wrap justify-center gap-2">
				<button v-for="(v, k) in currentFilters" :key="k" class="btn-xs btn rounded-full" disabled
					:class="[ v ? 'btn-primary text-base-100' : 'btn-ghost !border-2 !border-primary text-neutral-focus/75' ]" 
					@click="currentFilters[k] = !currentFilters[k]">
					{{ k }}
				</button>
			</div>
		</div>
		<div class="flex flex-wrap items-end justify-between gap-2">
			<p class="font-medium">
				Installed plugins: {{ pluginsState.data?.installed.length ?? 0 }}
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
				Failed to fetch plugins
			</div>
		</div>
		<div v-else class="flex flex-col gap-4">
			<div v-for="item in filteredList" :key="item.id" class="flex gap-4 rounded-xl bg-base-200 p-4">
				<img v-if="item.thumb" :src="item.thumb" class="h-20 w-20 self-center object-contain">
				<div v-else class="placeholder avatar self-center">
					<div class="h-20 w-20 rounded-lg bg-gradient-to-b from-blue-500 to-primary text-base-100">
						<span class="text-5xl font-bold leading-3">{{ _.upperFirst(item.name)[0] }}</span>
					</div>
				</div>
				<div class="flex grow flex-col">
					<div class="flex justify-between">
						<p class="text-sm font-medium text-neutral-focus">
							<span class="text-xl font-bold text-neutral">{{ item.name }}</span>
							by
							<a :href="item.author_url" target="_blank" 
								class="link-primary link no-underline" :class="{'pointer-events-none': item.author_url === ''}">
								{{ item.author_name }}
							</a>
						</p>
						<!-- TODO: When server adds the property, show toggle only for installed plugins, otherwise a "INSTALL" button -->
						<input v-if="item.id !== 'core_plugin'" type="checkbox" disabled
							class="!toggle-success !toggle" @click="togglePlugin(item.id)">
					</div>
					<div class="flex items-center gap-1 text-sm font-medium text-neutral-focus">
						<p>v{{ item.version }}</p>
						<a v-if="item.plugin_url" :href="item.plugin_url" target="_blank" 
							class="btn-ghost btn-square btn-xs btn text-primary">
							<heroicons-link-20-solid class="h-4 w-4" />
						</a>
					</div>
					<p class="text-sm">
						{{ item.description }}
					</p>
					<div class="mt-2 flex flex-wrap gap-2">
						<div v-for="tag in item.tags.split(',')" :key="tag" class="badge badge-primary font-medium">
							{{ tag.trim() }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
