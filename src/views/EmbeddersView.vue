<script setup lang="ts">
import { type JSONSettings, type SchemaField } from '@models/JSONSchema'
import { useEmbedderConfig } from '@stores/useEmbedderConfig'

const storeEmbedder = useEmbedderConfig()
const { getEmbedderSchema, getEmbedderSettings, setEmbedderSettings, refreshSettings } = storeEmbedder
const { currentState: embedderState, getAvailableEmbedders } = storeToRefs(storeEmbedder)

const selectedEmbedder = ref(embedderState.value.selected)
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
	selectedEmbedder.value = selected
	currentSchema.value = getEmbedderSchema(selected)
	currentFields.value = generateVeeObject(currentSchema.value)
	currentSettings.value = getEmbedderSettings(selected)
}

const saveEmbedder = async (payload: JSONSettings) => {
	if (!selectedEmbedder.value) return
	const res = await setEmbedderSettings(selectedEmbedder.value, payload)
	if (res) emit('close')
}

watchDeep(
	embedderState,
	() => {
		updateProperties(embedderState.value.selected)
	},
	{ immediate: true },
)
</script>

<template>
	<div class="flex grow flex-col gap-4">
		<ErrorBox
			v-if="embedderState.loading || embedderState.error"
			:load="embedderState.loading"
			:error="embedderState.error"
			text="Saving settings..." />
		<div v-else class="flex grow flex-col gap-4">
			<SelectBox
				v-model="selectedEmbedder"
				:list="getAvailableEmbedders.map(p => ({ label: p.humanReadableName ?? p.title, value: p.title }))"
				@update="(e: any) => updateProperties(e.value)" />
			<div class="flex grow flex-col gap-4">
				<div class="flex items-center gap-1 font-medium">
					<a v-if="currentSchema?.link" :href="currentSchema.link" target="_blank" class="btn btn-circle btn-primary btn-xs">
						<heroicons-link-20-solid class="size-4" />
					</a>
					<span>{{ currentSchema?.description }}</span>
				</div>
				<DynamicForm :values="currentSettings" :fields="currentFields" @submit="saveEmbedder" />
			</div>
		</div>
	</div>
</template>
