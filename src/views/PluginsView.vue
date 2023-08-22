<script setup lang="ts">
import { upperFirst, entries } from 'lodash'
import { type Plugin, AcceptedPluginTypes } from 'ccat-api'
import { usePlugins } from '@stores/usePlugins'
import { useSettings } from '@stores/useSettings'
import SidePanel from '@components/SidePanel.vue'
import ModalBox from '@components/ModalBox.vue'
import { InputType, type SchemaField, type JSONSettings } from '@models/JSONSchema'

const store = usePlugins()
const { togglePlugin, removePlugin, installPlugin, updateSettings, isInstalled, getSchema, getSettings } = store
const { currentState: pluginsState } = storeToRefs(store)

const { pluginsFilters } = storeToRefs(useSettings())

const { open: uploadPlugin, onChange: onPluginUpload } = useFileDialog()

const boxRemove = ref<InstanceType<typeof ModalBox>>()
const settingsPanel = ref<InstanceType<typeof SidePanel>>()
const selectedPageSize = ref(25)
const searchText = ref('')
const pluginsList = ref<Plugin[]>([])
const filteredList = ref<Plugin[]>([])
const selectedPlugin = ref<Plugin>()
const currentSettings = ref<JSONSettings>()
const currentFields = ref<SchemaField[]>([])

watchDeep(pluginsState, () => {
	pluginsList.value = [
		...new Set([...(pluginsState.value.data?.installed ?? []), ...(pluginsState.value.data?.registry ?? [])]),
	]
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

const openSettings = async (plugin: Plugin) => {
	selectedPlugin.value = plugin
	const pluginSchema = getSchema(plugin.id)
	currentSettings.value = await getSettings(plugin.id)
	currentFields.value = entries(pluginSchema?.properties).map<SchemaField>(([key, value]) => {
		return {
			name: key,
			as: 'input',
			label: value.title,
			type: value.format ?? InputType[value.type as keyof typeof InputType],
			rules: value.default !== undefined || value.type == 'checkbox' ? '' : 'required',
			default: value.default,
		}
	})
	settingsPanel.value?.togglePanel()
}

const savePluginSettings = async (payload: JSONSettings) => {
	if (!selectedPlugin.value?.id) return
	const res = await updateSettings(selectedPlugin.value.id, payload)
	if (res) settingsPanel.value?.togglePanel()
}

const searchPlugin = () => {
	filteredList.value = pluginsList.value.filter(p => {
		return p.name.toLowerCase().includes(searchText.value) || p.id.toLowerCase().includes(searchText.value)
	})
}

watch(pluginsFilters, () => {
	const filters = pluginsFilters.value
	filteredList.value = pluginsList.value.filter(p => {
		const list =
			filters.presence.current == 'both' ||
			(filters.presence.current == 'installed' && isInstalled(p.id)) ||
			(filters.presence.current == 'registry' && !isInstalled(p.id))
		const visible =
			filters.visibility.current == 'both' ||
			(filters.visibility.current == 'enabled' && p.active) ||
			(filters.visibility.current == 'disabled' && !p.active)
		return list && visible
	})
})
</script>

<template>
	<div class="flex w-full flex-col gap-8 self-center md:w-3/4">
		<div class="flex flex-col gap-4">
			<InputBox
				v-model.trim="searchText"
				placeholder="Enter a plugin name..."
				label="Search for a plugin"
				search
				:disabled="pluginsState.loading || Boolean(pluginsState.error)"
				@send="searchPlugin()" />
			<div class="flex flex-wrap justify-center gap-2">
				<button
					v-for="(v, k) of pluginsFilters"
					:key="k"
					class="btn btn-ghost btn-xs rounded-full !border-2 !border-primary"
					@click="v.current = v.values[v.values.indexOf(v.current) + 1] ?? v.values[0]">
					<span class="text-primary">{{ k }}:</span>
					<span>{{ v.current }}</span>
				</button>
			</div>
		</div>
		<div class="flex flex-wrap items-end justify-between gap-2">
			<p class="font-medium">Installed plugins: {{ pluginsState.data?.installed?.length ?? 0 }}</p>
			<!--<SelectBox v-model="selectedPageSize" :list="[10, 25, 50, 100].map(p => ({ label: p.toString(), value: p }))" />-->
			<button
				:disabled="pluginsState.loading || Boolean(pluginsState.error)"
				class="btn btn-primary btn-sm"
				@click="uploadPlugin({ multiple: false, accept: AcceptedPluginTypes.join(',') })">
				Upload plugin
			</button>
		</div>
		<ErrorBox
			v-if="pluginsState.loading || pluginsState.error"
			:load="pluginsState.loading"
			:error="pluginsState.error" />
		<div v-else-if="filteredList.length > 0" class="flex flex-col gap-4">
			<Pagination v-slot="{ list }" :list="filteredList" :pageSize="selectedPageSize">
				<div v-for="item in list" :key="item.id" class="flex gap-2 rounded-xl bg-base-100 p-2 md:gap-4 md:p-4">
					<img v-if="item.thumb" :src="item.thumb" class="h-20 w-20 self-center object-contain" />
					<div v-else class="avatar placeholder self-center">
						<div class="h-20 w-20 rounded-lg bg-gradient-to-b from-accent to-primary text-base-100">
							<span class="text-5xl font-bold leading-3">{{ upperFirst(item.name)[0] }}</span>
						</div>
					</div>
					<div class="flex grow flex-col">
						<div class="flex justify-between">
							<p class="text-sm font-medium text-neutral-focus">
								<span class="text-xl font-bold text-neutral">{{ item.name }}</span>
								by
								<a
									:href="item.author_url"
									target="_blank"
									class="link-primary link no-underline"
									:class="{ 'pointer-events-none': item.author_url === '' }">
									{{ item.author_name }}
								</a>
							</p>
							<template v-if="item.id !== 'core_plugin'">
								<button v-if="isInstalled(item.id)" class="btn btn-error btn-xs" @click="openRemoveModal(item)">
									Delete
								</button>
								<button v-else class="btn btn-success btn-xs">Install</button>
							</template>
						</div>
						<div class="flex h-6 items-center gap-1 text-sm font-medium text-neutral-focus">
							<p>v{{ item.version }}</p>
							<a
								v-if="item.plugin_url"
								:href="item.plugin_url"
								target="_blank"
								class="btn btn-circle btn-primary btn-xs">
								<heroicons-link-20-solid class="h-4 w-4" />
							</a>
						</div>
						<p class="my-2 text-sm">
							{{ item.description }}
						</p>
						<div class="flex h-8 items-center justify-between gap-4">
							<div class="flex flex-wrap gap-2">
								<div v-for="tag in item.tags.split(',')" :key="tag" class="badge badge-primary font-medium">
									{{ tag.trim() }}
								</div>
							</div>
							<div class="flex flex-wrap items-center gap-2">
								<button
									v-if="isInstalled(item.id) && getSchema(item.id) && item.active"
									class="btn btn-circle btn-ghost btn-sm"
									@click="openSettings(item)">
									<heroicons-cog-6-tooth-20-solid class="h-5 w-5" />
								</button>
								<input
									v-if="item.id !== 'core_plugin' && isInstalled(item.id)"
									v-model="item.active"
									type="checkbox"
									class="!toggle !toggle-success"
									@click="togglePlugin(item.id, item.name, item.active!)" />
							</div>
						</div>
					</div>
				</div>
			</Pagination>
		</div>
		<div v-else class="flex grow items-center justify-center">
			<p class="rounded-lg bg-base-200 p-4 text-lg font-medium md:text-xl">No plugins found with this name.</p>
		</div>
		<SidePanel ref="settingsPanel" title="Plugin Settings">
			<DynamicForm :fields="currentFields" :initial="currentSettings" @submit="savePluginSettings" />
		</SidePanel>
		<ModalBox ref="boxRemove">
			<div class="flex flex-col items-center justify-center gap-4 text-neutral">
				<h3 class="text-lg font-bold text-primary">Remove plugin</h3>
				<p>
					Are you sure you want to remove the
					<span class="font-bold">
						{{ selectedPlugin?.name }}
					</span>
					plugin?
				</p>
				<div class="flex items-center justify-center gap-2">
					<button class="btn btn-outline btn-sm" @click="boxRemove?.toggleModal()">No</button>
					<button class="btn btn-error btn-sm" @click="deletePlugin()">Yes</button>
				</div>
			</div>
		</ModalBox>
	</div>
</template>
