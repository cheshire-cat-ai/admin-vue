<script setup lang="ts">
import { type JSONSettings, type SchemaField } from '@models/JSONSchema'
import { useAuthConfig } from '@stores/useAuthConfig'

const storeAuth = useAuthConfig()
const { getHandlerSchema, getHandlerSettings, setHandlerSettings, refreshSettings } = storeAuth
const { currentState: authState, getAvailableHandlers } = storeToRefs(storeAuth)
const { cannot } = usePerms()
const selectedHandler = ref(authState.value.selected)
const currentSchema = ref<JSONSettings>()
const currentSettings = ref<JSONSettings>({})
const currentFields = ref<SchemaField[]>([])

const emit = defineEmits<{
	close: []
}>()

onMounted(() => {
	refreshSettings()
})

const updateProperties = (selected = currentSchema.value?.title) => {
	selectedHandler.value = selected
	currentSchema.value = getHandlerSchema(selected)
	currentFields.value = generateVeeObject(currentSchema.value)
	currentSettings.value = getHandlerSettings(selected)
}

const saveAuth = async (payload: JSONSettings) => {
	if (!selectedHandler.value) return
	const res = await setHandlerSettings(selectedHandler.value, payload)
	if (res) emit('close')
}

watchDeep(
	authState,
	() => {
		updateProperties(authState.value.selected)
	},
	{ immediate: true },
)
</script>

<template>
	<div class="flex grow flex-col gap-4">
		<ErrorBox v-if="authState.loading || authState.error" :load="authState.loading" :error="authState.error" text="Saving settings..." />
		<div v-else class="flex grow flex-col gap-4">
			<SelectBox
				v-model="selectedHandler"
				:list="getAvailableHandlers.map(p => ({ label: p.humanReadableName ?? p.title, value: p.title }))"
				:disabled="cannot('LIST', 'AUTH_HANDLER')"
				@update="(e: any) => updateProperties(e.value)" />
			<div class="flex grow flex-col gap-4">
				<div class="flex items-center gap-1 font-medium">
					<a v-if="currentSchema?.link" :href="currentSchema.link" target="_blank" class="btn btn-circle btn-primary btn-xs">
						<heroicons-link-20-solid class="size-4" />
					</a>
					<span>{{ currentSchema?.description }}</span>
				</div>
				<DynamicForm :values="currentSettings" :fields="currentFields" @submit="saveAuth" />
			</div>
		</div>
	</div>
</template>
