<script setup lang="ts">
import _ from 'lodash'
import type { Plugin } from 'ccat-api'
import { usePlugins } from '@stores/usePlugins'
import { useSettings } from '@stores/useSettings'

const store = usePlugins()
const { togglePlugin, removePlugin, installPlugin } = store
const { currentState: pluginsState } = storeToRefs(store)

const { currentFilters } = storeToRefs(useSettings())

const { open: uploadPlugin, onChange: onPluginUpload } = useFileDialog()

const searchText = ref("")
const pluginsList = ref<Plugin[]>([])
const filteredList = ref<Plugin[]>([])

watchDeep(pluginsState, () => {
	pluginsList.value = [...new Set([
		...pluginsState.value.data?.installed ?? [],
		...pluginsState.value.data?.registry ?? []
	])]
	filteredList.value = pluginsList.value
})

/**
 * Handles the plugin upload by calling the installPlugin endpoint with the file attached.
 */
onPluginUpload(files => {
	if (files == null) return
	installPlugin(files[0])
})

const searchPlugin = () => {
	filteredList.value = pluginsList.value.filter(p => {
		return p.name.toLowerCase().includes(searchText.value) ||
		p.id.toLowerCase().includes(searchText.value)
	})
}
</script>

<template>
	<div class="flex w-full flex-col gap-8 self-center md:w-3/4">
		<div class="col-span-2 flex flex-col items-center justify-center gap-2 rounded-md p-4">
			<p class="text-3xl font-bold text-primary">
				Plugins
			</p>
			<p class="text-center font-medium">
				This page displays the list of installed plugins together with 
				those from the official registry of the <strong>Cheshire Cat</strong>.
				Here you can enable or disable individual plugins according to your needs,
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
						:disabled="pluginsState.loading || Boolean(pluginsState.error)"
						class="input-primary input input-sm w-full" @keyup.enter="searchPlugin()">
					<button class="btn-primary btn-square btn-sm btn absolute right-0 top-0" 
						:disabled="pluginsState.loading || Boolean(pluginsState.error)" @click="searchPlugin()">
						<heroicons-magnifying-glass-20-solid class="h-5 w-5" />
					</button>
				</div>
			</div>
			<div class="flex flex-wrap justify-center gap-2">
				<button v-for="(v, k) in currentFilters" :key="k" class="btn-xs btn rounded-full" disabled
					:class="[ v ? 'btn-primary text-base-100' : 'btn-ghost !border-2 !border-primary' ]" 
					@click="currentFilters[k] = !currentFilters[k]">
					{{ k }}
				</button>
			</div>
		</div>
		<div class="flex flex-wrap items-end justify-between gap-2">
			<p class="font-medium">
				Installed plugins: {{ pluginsState.data?.installed.length ?? 0 }}
			</p>
			<button class="btn-primary btn-sm btn" @click="uploadPlugin({ multiple: false, accept: 'application/zip' })">
				Upload plugin
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
		<div v-else-if="filteredList.length > 0" class="flex flex-col gap-4">
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
						<template v-if="item.id !== 'core_plugin'">
							<!-- TODO: When server adds the property, show only for installed plugins, otherwise a "INSTALL" button -->
							<button class="btn-error btn-xs btn" @click="removePlugin(item.id)">
								Delete
							</button>
							<!--<button class="btn-success btn-xs btn">
								Install
							</button>-->
						</template>
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
					<div class="flex items-center justify-between gap-4">
						<div class="mt-2 flex flex-wrap gap-2">
							<div v-for="tag in item.tags.split(',')" :key="tag" class="badge badge-primary font-medium">
								{{ tag.trim() }}
							</div>
						</div>
						<!-- TODO: When server adds the property, show toggle only for installed plugins -->
						<input v-if="item.id !== 'core_plugin'" type="checkbox" disabled 
							class="!toggle-success !toggle" @click="togglePlugin(item.id)">
					</div>
				</div>
			</div>
		</div>
		<div v-else class="flex grow items-center justify-center">
			<p class="rounded-lg bg-base-200 p-4 text-lg font-medium md:text-xl">
				No plugins found with this name.
			</p>
		</div>
	</div>
</template>
