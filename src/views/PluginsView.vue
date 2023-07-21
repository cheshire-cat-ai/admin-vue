<script setup lang="ts">
import _ from 'lodash'
import { type Plugin, AcceptedPluginTypes } from 'ccat-api'
import { usePlugins } from '@stores/usePlugins'
import { useSettings } from '@stores/useSettings'
import ModalBox from '@components/ModalBox.vue'

const store = usePlugins()
const { togglePlugin, removePlugin, installPlugin } = store
const { currentState: pluginsState } = storeToRefs(store)

const { currentFilters } = storeToRefs(useSettings())

const { open: uploadPlugin, onChange: onPluginUpload } = useFileDialog()

const boxRemove = ref<InstanceType<typeof ModalBox>>()
const searchText = ref("")
const pluginsList = ref<Plugin[]>([])
const filteredList = ref<Plugin[]>([])
const selectedPlugin = ref<Plugin>()

watchDeep(pluginsState, () => {
	pluginsList.value = [...new Set([
		...pluginsState.value.data?.installed ?? [],
		...pluginsState.value.data?.registry ?? []
	])]
	filteredList.value = pluginsList.value
})

const openRemoveModal = (plugin: Plugin) => {
	selectedPlugin.value = plugin
	boxRemove.value?.toggleModal()
}

const deletePlugin = async () => {
	if (!selectedPlugin.value) return
	await removePlugin(selectedPlugin.value.id)
	boxRemove.value?.toggleModal()
}

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
				{{ $t('headers.plugins') }}
			</p>
			<i18n-t keypath="plugins.desc" tag="p" class="text-center font-medium">
				<strong>{{ $t('cheshire_cat') }}</strong>
			</i18n-t>
		</div>
		<div class="flex flex-col gap-4">
			<InputBox v-model.trim="searchText" placeholder="Enter a plugin name..." :label="$t('plugins.search')" 
				search :disabled="pluginsState.loading || Boolean(pluginsState.error)" @send="searchPlugin()" />
			<div class="flex flex-wrap justify-center gap-2">
				<button v-for="(v, k) in currentFilters" :key="k" class="btn btn-xs rounded-full" disabled
					:class="[ v ? 'btn-primary text-base-100' : 'btn-ghost !border-2 !border-primary' ]" 
					@click="currentFilters[k] = !currentFilters[k]">
					{{ k }}
				</button>
			</div>
		</div>
		<div class="flex flex-wrap items-end justify-between gap-2">
			<p class="font-medium">
				{{ $t('plugins.installed', { num: pluginsState.data?.installed?.length ?? 0 }) }}
			</p>
			<button :disabled="pluginsState.loading || Boolean(pluginsState.error)"
				class="btn btn-primary btn-sm" @click="uploadPlugin({ multiple: false, accept: AcceptedPluginTypes.join(',') })">
				{{ $t('plugins.upload') }}
			</button>
		</div>
		<div v-if="pluginsState.loading" class="flex grow items-center justify-center">
			<span class="loading loading-spinner w-12 text-primary" />
		</div>
		<div v-else-if="pluginsState.error" class="flex grow items-center justify-center">
			<div class="rounded-md bg-error p-4 font-bold text-base-100 shadow-xl">
				{{ pluginsState.error }}
			</div>
		</div>
		<div v-else-if="filteredList.length > 0" class="flex flex-col gap-4">
			<div v-for="item in filteredList" :key="item.id" class="flex gap-4 rounded-xl bg-base-100 p-4">
				<img v-if="item.thumb" :src="item.thumb" class="h-20 w-20 self-center object-contain">
				<div v-else class="avatar placeholder self-center">
					<div class="h-20 w-20 rounded-lg bg-gradient-to-b from-blue-500 to-primary text-base-100">
						<span class="text-5xl font-bold leading-3">{{ _.upperFirst(item.name)[0] }}</span>
					</div>
				</div>
				<div class="flex grow flex-col">
					<div class="flex justify-between">
						<i18n-t keypath="plugins.item_title" tag="p" class="text-sm font-medium text-neutral-focus">
							<span class="text-xl font-bold text-neutral">{{ item.name }}</span>
							<a :href="item.author_url" target="_blank" 
								class="link-primary link no-underline" :class="{'pointer-events-none': item.author_url === ''}">
								{{ item.author_name }}
							</a>
						</i18n-t>
						<template v-if="item.id !== 'core_plugin'">
							<!-- TODO: When server adds the property, show only for installed plugins, otherwise a "INSTALL" button -->
							<button class="btn btn-error btn-xs" @click="openRemoveModal(item)">
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
							class="btn btn-circle btn-ghost btn-xs text-primary">
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
							class="!toggle !toggle-success" @click="togglePlugin(item.id)">
					</div>
				</div>
			</div>
		</div>
		<div v-else class="flex grow items-center justify-center">
			<p class="rounded-lg bg-base-200 p-4 text-lg font-medium md:text-xl">
				No plugins found with this name.
			</p>
		</div>
		<ModalBox ref="boxRemove">
			<div class="flex flex-col items-center justify-center gap-4 text-neutral">
				<h3 class="text-lg font-bold text-primary">
					Remove plugin
				</h3>
				<p>
					Are you sure you want to remove the
					<span class="font-bold">
						{{ selectedPlugin?.name }}
					</span> 
					plugin?
				</p>
				<div class="flex items-center justify-center gap-2">
					<button class="btn btn-outline btn-sm" @click="boxRemove?.toggleModal()">
						No
					</button>
					<button class="btn btn-error btn-sm" @click="deletePlugin()">
						Yes
					</button>
				</div>
			</div>
		</ModalBox>
	</div>
</template>
