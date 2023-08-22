import type { PluginsState } from '@stores/types'
import type { Plugin } from 'ccat-api'
import { useNotifications } from '@stores/useNotifications'
import PluginService from '@services/PluginService'
import type { JSONSettings } from '@models/JSONSchema'

export const usePlugins = defineStore('plugins', () => {
	const currentState = reactive<PluginsState>({
		loading: false,
		data: {
			installed: [],
			registry: [],
		},
	})

	const { state: plugins, isLoading, execute: fetchPlugins } = useAsyncState(PluginService.getPlugins(), undefined)
	const { state: settings, execute: fetchSettings } = useAsyncState(PluginService.getPluginsSettings(), undefined)

	const { showNotification, sendNotificationFromJSON } = useNotifications()

	watchEffect(() => {
		currentState.loading = isLoading.value
		currentState.data = plugins.value?.data
		currentState.error = plugins.value?.status === 'error' ? plugins.value.message : undefined
	})

	const isInstalled = (id: Plugin['id']) => currentState.data?.installed.find(p => p.id === id)

	const getSchema = (id: Plugin['id']) => settings.value?.data?.settings.find(p => p.name === id)?.schema

	const getSettings = async (id: Plugin['id']) => (await PluginService.getSinglePluginSettings(id))?.value

	const togglePlugin = async (id: Plugin['id'], name: Plugin['name'], active: boolean) => {
		if (isInstalled(id)) {
			const res = await PluginService.togglePlugin(id)
			if (res.status == 'success') {
				showNotification({
					text: `Plugin ${name} is being switched ${active ? 'OFF' : 'ON'}!`,
					type: 'info',
				})
			} else sendNotificationFromJSON(res)
			fetchPlugins()
			return true
		}
		return false
	}

	const updateSettings = async (id: Plugin['id'] | undefined, settings: JSONSettings) => {
		if (!id) return false
		if (isInstalled(id)) {
			const res = await PluginService.updateSettings(id, settings)
			sendNotificationFromJSON(res)
			return res.status != 'error'
		}
	}

	const removePlugin = async (id: Plugin['id']) => {
		if (currentState.data?.installed.find(p => p.id === id)) {
			await PluginService.deletePlugin(id)
			fetchPlugins()
			return true
		}
		return false
	}

	const installPlugin = async (file: File) => {
		currentState.loading = true
		const res = await PluginService.sendFile(file)
		currentState.loading = false
		sendNotificationFromJSON(res)
	}

	return {
		currentState,
		togglePlugin,
		fetchPlugins,
		removePlugin,
		installPlugin,
		isInstalled,
		updateSettings,
		getSchema,
		getSettings,
		fetchSettings,
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(usePlugins, import.meta.hot))
}
