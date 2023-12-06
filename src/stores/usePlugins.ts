import type { PluginsState } from '@stores/types'
import type { Plugin } from 'ccat-api'
import { useNotifications } from '@stores/useNotifications'
import PluginService from '@services/PluginService'
import type { JSONSettings } from '@models/JSONSchema'
import { useSettings } from '@stores/useSettings'

export const usePlugins = defineStore('plugins', () => {
	const currentState = reactive<PluginsState>({
		loading: false,
		data: {
			installed: [],
			registry: [],
		},
	})

	const { state: plugins, isLoading, execute: fetchPlugins } = useAsyncState(PluginService.getPlugins, undefined)
	const { state: settings, execute: fetchSettings } = useAsyncState(PluginService.getPluginsSettings, undefined)

	onActivated(() => fetchPlugins())

	const { isReadyAndAuth } = storeToRefs(useSettings())
	// TODO: Find a way to refresh calls without watching the boolean value (fix resetAllStores())
	watch(isReadyAndAuth, () => {
		fetchPlugins()
		fetchSettings()
	})

	const { showNotification, sendNotificationFromJSON } = useNotifications()

	watchEffect(() => {
		currentState.loading = isLoading.value
		currentState.data = plugins.value?.data
		currentState.error = plugins.value?.status === 'error' ? plugins.value.message : undefined
	})

	const getSchema = (id: Plugin['id']) => settings.value?.data?.settings.find(p => p.name === id)?.schema

	const getSettings = async (id: Plugin['id']) => (await PluginService.getSinglePluginSettings(id))?.value

	const togglePlugin = async (id: Plugin['id'], name: Plugin['name'], active: boolean) => {
		currentState.loading = true
		const res = await PluginService.togglePlugin(id)
		if (res.status == 'success') {
			showNotification({
				text: `Plugin "${name}" is being switched ${active ? 'OFF' : 'ON'}!`,
				type: 'info',
			})
		} else sendNotificationFromJSON(res)
		fetchSettings()
		fetchPlugins()
		currentState.loading = false
		return res.status != 'error'
	}

	const updateSettings = async (id: Plugin['id'], settings: JSONSettings) => {
		const res = await PluginService.updateSettings(id, settings)
		sendNotificationFromJSON(res)
		return res.status != 'error'
	}

	const removePlugin = async (id: Plugin['id']) => {
		if (currentState.data?.installed.find(p => p.id === id)) {
			const res = await PluginService.deletePlugin(id)
			sendNotificationFromJSON(res)
			fetchPlugins()
			return res.status != 'error'
		}
		return false
	}

	const installPlugin = async (file: File) => {
		currentState.loading = true
		const res = await PluginService.sendFile(file)
		await fetchSettings()
		await fetchPlugins()
		currentState.loading = false
		sendNotificationFromJSON(res)
	}

	const searchPlugin = async (query: string) => {
		currentState.loading = true
		const res = await PluginService.searchPlugin(query)
		if (res.status == 'error') sendNotificationFromJSON(res)
		currentState.loading = false
		return res.data
	}

	const installRegistryPlugin = async (url: string) => {
		currentState.loading = true
		const res = await PluginService.installFromRegistry(url)
		if (res.status == 'error') sendNotificationFromJSON(res)
		fetchSettings()
		fetchPlugins()
		currentState.loading = false
		return res.data
	}

	return {
		currentState,
		togglePlugin,
		fetchPlugins,
		removePlugin,
		installPlugin,
		updateSettings,
		getSchema,
		getSettings,
		fetchSettings,
		searchPlugin,
		installRegistryPlugin,
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(usePlugins, import.meta.hot))
}
