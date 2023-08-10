<script setup lang="ts">
import { type JSONSettings, type SchemaField, InputType } from '@models/JSONSchema'
import { useEmbedderConfig } from '@stores/useEmbedderConfig'
import type { JsonSchema } from 'ccat-api'
import SelectBox from '@components/SelectBox.vue'

const storeEmbedder = useEmbedderConfig()
const { getEmbedderSchema, getEmbedderSettings, setEmbedderSettings } = storeEmbedder
const { currentState: embedderState, getAvailableEmbedders } = storeToRefs(storeEmbedder)

const selectEmbedder = ref<InstanceType<typeof SelectBox>>()
const currentSchema = ref<JsonSchema>()
const currentSettings = ref<JSONSettings>({})
const currentFields = ref<SchemaField[]>([])

const emit = defineEmits<{
	(e: 'close'): void
}>()

const updateProperties = (selected = currentSchema.value?.title) => {
	currentSchema.value = getEmbedderSchema(selected)
	currentFields.value = Object.entries(currentSchema.value?.properties ?? {}).map<SchemaField>(([key, value]) => {
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
	const embName = selectEmbedder.value?.selectedElement
	if (!embName?.value) return
	const res = await setEmbedderSettings(embName.value, payload)
	if (res) emit('close')
}

watchDeep(embedderState, () => {
	updateProperties(selectEmbedder.value?.selectedElement?.value)
}, { immediate: true })
</script>

<template>
	<div class="flex grow flex-col gap-4">
		<ErrorBox v-if="embedderState.loading || embedderState.error" 
			:load="embedderState.loading" :error="embedderState.error" />
		<div v-else class="flex grow flex-col gap-4">
			<SelectBox ref="selectEmbedder" :picked="embedderState.selected"
				:list="getAvailableEmbedders.map(p => ({ label: p?.humanReadableName ?? p?.title, value: p?.title }))"
				@update="e => updateProperties(e.value)" />
			<div class="flex flex-col gap-4">
				<p class="font-medium">
					{{ currentSchema?.description }}
				</p>
				<DynamicForm :fields="currentFields" :initial="currentSettings" @submit="saveEmbedder" />
			</div>
		</div>
	</div>
</template>
