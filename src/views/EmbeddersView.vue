<script setup lang="ts">
import { entries } from 'lodash'
import { type JSONSettings, type SchemaField, InputType } from '@models/JSONSchema'
import { useEmbedderConfig } from '@stores/useEmbedderConfig'
import type { JsonSchema } from 'ccat-api'

const storeEmbedder = useEmbedderConfig()
const { getEmbedderSchema, getEmbedderSettings, setEmbedderSettings } = storeEmbedder
const { currentState: embedderState, getAvailableEmbedders } = storeToRefs(storeEmbedder)

const selectedEmbedder = ref(embedderState.value.selected)
const currentSchema = ref<JsonSchema>()
const currentSettings = ref<JSONSettings>({})
const currentFields = ref<SchemaField[]>([])

const emit = defineEmits<{
	(e: 'close'): void
}>()

const updateProperties = (selected = currentSchema.value?.title) => {
	currentSchema.value = getEmbedderSchema(selected)
	currentFields.value = entries(currentSchema.value?.properties ?? {}).map<SchemaField>(([key, value]) => {
		return {
			name: key,
			as: 'input',
			label: value.title,
			type: InputType[value.type as keyof typeof InputType],
			rules: value.default !== undefined ? '' : 'required',
			default: value.default,
		}
	})
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
		updateProperties(selectedEmbedder.value)
	},
	{ immediate: true },
)
</script>

<template>
	<div class="flex grow flex-col gap-4">
		<ErrorBox
			v-if="embedderState.loading || embedderState.error"
			:load="embedderState.loading"
			:error="embedderState.error" />
		<div v-else class="flex grow flex-col gap-4">
			<SelectBox
				v-model="selectedEmbedder"
				:list="getAvailableEmbedders.map(p => ({ label: p.humanReadableName ?? p.title, value: p.title }))"
				@update="e => updateProperties(e.value)" />
			<div class="flex grow flex-col gap-4">
				<p class="font-medium">
					{{ currentSchema?.description }}
				</p>
				<DynamicForm :fields="currentFields" :initial="currentSettings" @submit="saveEmbedder" />
			</div>
		</div>
	</div>
</template>
