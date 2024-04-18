<script setup lang="ts">
import { upperFirst, isEmpty, groupBy } from 'lodash'
import { type Plugin } from 'ccat-api'
import { usePlugins } from '@stores/usePlugins'
import { useSettings } from '@stores/useSettings'
import SidePanel from '@components/SidePanel.vue'
import ModalBox from '@components/ModalBox.vue'
import { type SchemaField, type JSONSettings } from '@models/JSONSchema'

const store = usePlugins()
const { togglePlugin, removePlugin, updateSettings, getSchema, getSettings, searchPlugin, installRegistryPlugin } = store
const { currentState: pluginsState } = storeToRefs(store)

const { pluginsFilters } = storeToRefs(useSettings())

const { upload: uploadFile } = uploadContent()

const boxRemove = ref<InstanceType<typeof ModalBox>>()
const settingsPanel = ref<InstanceType<typeof SidePanel>>()
const infoPanel = ref<InstanceType<typeof SidePanel>>()
const selectedPageSize = ref(25)
const searchText = ref('')
const pluginsList = ref<Plugin[]>([])
const filteredList = ref<Plugin[]>([])
const selectedPlugin = ref<Plugin>()
const currentSettings = ref<JSONSettings>()
const currentFields = ref<SchemaField[]>([])

watchEffect(() => {
	pluginsList.value = [
		...new Set([
			...(pluginsState.value.data?.installed.sort((a, b) => Number(b.active) - Number(a.active)) ?? []),
			...(pluginsState.value.data?.registry ?? []),
		]),
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

const openInfo = (plugin: Plugin) => {
	selectedPlugin.value = plugin
	infoPanel.value?.togglePanel()
}

const openSettings = async (plugin: Plugin) => {
	selectedPlugin.value = plugin
	currentSettings.value = await getSettings(plugin.id)
	currentFields.value = generateVeeObject(getSchema(plugin.id))
	settingsPanel.value?.togglePanel()
}

const savePluginSettings = async (payload: JSONSettings) => {
	if (!selectedPlugin.value?.id) return
	const res = await updateSettings(selectedPlugin.value.id, payload)
	if (res) settingsPanel.value?.togglePanel()
}

const queryPlugins = async () => {
	const text = searchText.value.toLowerCase()
	const list = await searchPlugin(text)
	filteredList.value = [...new Set([...(list?.installed ?? []), ...(list?.registry ?? [])])]
}

watchEffect(() => {
	// TODO: Improve filtering rules and code logic
	const filters = pluginsFilters.value
	filteredList.value = pluginsList.value.filter(p => {
		const list =
			filters.presence.current == 'both' ||
			(filters.presence.current == 'installed' && p.id) ||
			(filters.presence.current == 'registry' && p.url)
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
				@send="queryPlugins()" />
			<div class="flex flex-wrap justify-center gap-2">
				<heroicons-adjustments-vertical class="size-6" />
				<button
					v-for="(v, k) of pluginsFilters"
					:key="k"
					class="btn btn-ghost btn-xs rounded-md !border-2 !border-primary uppercase hover:bg-base-100"
					@click="v.current = v.values[v.values.indexOf(v.current) + 1] ?? v.values[0]">
					<span class="text-primary">{{ k }}:</span>
					<span>{{ v.current }}</span>
				</button>
			</div>
		</div>
		<div class="flex flex-wrap items-end justify-between gap-2">
			<p class="font-medium">Installed plugins: {{ pluginsState.data?.installed?.length ?? 0 }}</p>
			<!--<SelectBox v-model="selectedPageSize" :list="[10, 25, 50, 100].map(p => ({ label: p.toString(), value: p }))" />-->
			<div class="flex flex-wrap items-end justify-between gap-2">
				<a
					href="https://cheshire-cat-ai.github.io/docs/plugins-registry/plugin-from-template/"
					target="_blank"
					class="btn btn-outline btn-primary btn-sm rounded-md hover:shadow-lg">
					<ph-lightbulb-filament-fill class="size-4" />
					Create plugin
				</a>
				<button
					:disabled="pluginsState.loading || Boolean(pluginsState.error)"
					class="btn btn-primary btn-sm rounded-md hover:shadow-lg"
					@click="uploadFile('plugin')">
					<ph-export-bold class="size-4" />
					Upload plugin
				</button>
			</div>
		</div>
		<ErrorBox v-if="pluginsState.loading || pluginsState.error" :load="pluginsState.loading" :error="pluginsState.error" />
		<div v-else-if="filteredList.length > 0" class="flex flex-col gap-4">
			<Pagination v-slot="{ list }" :list="filteredList" :pageSize="selectedPageSize">
				<div v-for="item in list" :key="item.url ?? item.id" class="flex gap-2 rounded-xl bg-base-100 p-2 shadow md:gap-4 md:p-4">
					<UseImage :src="item.thumb" class="size-20 self-center object-contain">
						<template #error>
							<div class="avatar placeholder self-center">
								<div class="size-20 rounded-lg bg-gradient-to-b from-accent to-primary text-base-100">
									<span class="text-5xl font-bold leading-3">{{ upperFirst(item.name)[0] }}</span>
								</div>
							</div>
						</template>
					</UseImage>
					<div class="flex grow flex-col">
						<div class="flex items-center justify-between">
							<p class="flex items-baseline gap-1 text-sm font-medium text-neutral">
								<span class="text-xl font-bold text-neutral">{{ item.name }}</span>
								<a
									:href="item.plugin_url"
									target="_blank"
									class="link"
									:class="{ 'pointer-events-none no-underline': item.plugin_url === '' }">
									<span>v{{ item.version }}</span>
									<span v-if="item.upgrade">➡ {{ item.upgrade }}</span>
								</a>
							</p>
							<div class="flex gap-2">
								<button
									v-if="item.id !== 'core_plugin' && item.upgrade && item.plugin_url"
									class="btn btn-primary btn-xs rounded-md uppercase"
									@click="installRegistryPlugin(item.plugin_url)">
									<ph-export-bold class="size-4" />
									Upgrade
								</button>
								<button v-if="item.url" class="btn btn-primary btn-xs rounded-md uppercase" @click="installRegistryPlugin(item.url)">
									<heroicons-cloud-arrow-down-solid class="size-4" />
									Install
								</button>
								<button
									v-else-if="item.id !== 'core_plugin'"
									class="btn btn-error btn-xs rounded-md uppercase text-base-100"
									@click="openRemoveModal(item)">
									<heroicons-trash-solid class="size-3" />
									Delete
								</button>
							</div>
						</div>
						<div class="flex h-6 items-center gap-1 text-sm font-medium text-neutral">
							<span>by</span>
							<a
								:href="item.author_url"
								target="_blank"
								class="link"
								:class="{ 'pointer-events-none no-underline': item.author_url === '' }">
								{{ item.author_name }}
							</a>
						</div>
						<p class="my-2 text-sm">
							{{ item.description }}
						</p>
						<div class="flex h-8 items-center justify-between gap-4">
							<div class="flex flex-wrap gap-1">
								<div v-for="tag in item.tags.split(',')" :key="tag" class="badge rounded-lg border-neutral font-medium">
									{{ tag.trim() }}
								</div>
							</div>
							<div class="flex flex-wrap items-center gap-2">
								<button
									v-if="item.id && !isEmpty(getSchema(item.id)) && item.active"
									class="btn btn-circle btn-ghost btn-sm"
									@click="openSettings(item)">
									<heroicons-cog-6-tooth-20-solid class="size-5" />
								</button>
								<button
									v-if="(item.hooks && item.hooks.length > 0) || (item.tools && item.tools.length > 0)"
									class="btn btn-circle btn-ghost btn-sm"
									@click="openInfo(item)">
									<heroicons-information-circle-solid class="size-5" />
								</button>
								<input
									v-if="item.id !== 'core_plugin' && item.id"
									v-model="item.active"
									type="checkbox"
									class="!toggle !toggle-primary"
									@click="
										async () => {
											// TODO: Fix this workaround used to prevent checkbox switching when an error occurs
											const res = await togglePlugin(item.id, item.name, item.active ?? false)
											item.active = res ? item.active : false
										}
									" />
							</div>
						</div>
					</div>
				</div>
			</Pagination>
		</div>
		<div v-else class="flex grow items-center justify-center">
			<p class="rounded-lg bg-base-200 p-4 text-lg font-medium md:text-xl">No plugins found with this name.</p>
		</div>
		<SidePanel v-if="selectedPlugin" ref="infoPanel" title="Plugin Info">
			<div class="flex flex-col items-center gap-2">
				<div v-if="selectedPlugin.hooks && selectedPlugin.hooks.length > 0" class="w-full rounded-md bg-base-200 p-4">
					<h3 class="text-lg font-bold">🪝 Hooks</h3>
					<div v-for="(hook, index) of groupBy(selectedPlugin.hooks, h => h.priority)" :key="index">
						<span class="font-medium text-primary">Priority {{ index }} :</span>
						<br />
						<p v-for="{ name } in hook" :key="name">- {{ name }}</p>
					</div>
				</div>
				<div v-if="selectedPlugin.tools && selectedPlugin.tools.length > 0" class="w-full rounded-md bg-base-200 p-4">
					<h3 class="text-lg font-bold">🛠️ Tools</h3>
					<p v-for="{ name } in selectedPlugin.tools" :key="name">- {{ name }}</p>
				</div>
			</div>
		</SidePanel>
		<SidePanel ref="settingsPanel" title="Plugin Settings">
			<DynamicForm :values="currentSettings" :fields="currentFields" @submit="savePluginSettings" />
		</SidePanel>
		<Teleport to="#modal">
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
		</Teleport>
	</div>
</template>
