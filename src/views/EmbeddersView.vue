<script setup lang="ts">
import { type JSONSettings, type SchemaField, InputType } from '@models/JSONSchema'
import { useEmbedderConfig } from '@stores/useEmbedderConfig'
import type { JsonSchema } from 'ccat-api'
import SelectBox from '@components/SelectBox.vue'

const storeEmbedder = useEmbedderConfig()
const { getAvailableEmbedders, getEmbedderSchema, getEmbedderSettings, setEmbedderSettings } = storeEmbedder
const { currentState: embedderState } = storeToRefs(storeEmbedder)

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

const saveProvider = async (payload: JSONSettings) => {
	const llmName = selectEmbedder.value?.selectedElement
	if (!llmName?.value) return
	const res = await setEmbedderSettings(llmName.value, payload)
	if (res) emit('close')
}

const lastTimeUpdated = computed(() => {
	const dateString = embedderState.value.data?.settings.find(v => v.name === currentSchema.value?.title)?.updated_at
	if (dateString) return new Date(dateString * 1000).toLocaleString()
	else return 'Never'
})

onMounted(() => {
	updateProperties(selectEmbedder.value?.selectedElement?.value)
})

watchDeep(embedderState, () => {
	updateProperties(selectEmbedder.value?.selectedElement?.value)
}, { immediate: true })
</script>

<template>
	<div class="flex grow flex-col gap-4">
		<div v-if="embedderState.loading" class="flex grow items-center justify-center">
			<span class="loading loading-spinner w-12 text-primary" />
		</div>
		<div v-else-if="embedderState.error || !getAvailableEmbedders().length"
			class="flex grow items-center justify-center">
			<div class="rounded-md bg-error p-4 font-bold text-base-100 shadow-xl">
				{{ embedderState.error }}
			</div>
		</div>
		<div v-else class="flex grow flex-col gap-4">
			<SelectBox ref="selectEmbedder" :picked="embedderState.selected"
				:list="getAvailableEmbedders().map(p => ({ label: p.name_human_readable ?? p.title, value: p.title }))"
				@update="e => updateProperties(e.value)" />
			<div v-if="currentFields" class="flex grow flex-col gap-4">
				<div class="flex flex-col">
					<p class="font-medium">
						{{ currentSchema?.description }}
					</p>
					<p class="text-xs text-neutral-focus/75">
						Last time updated:
						{{ lastTimeUpdated }}
					</p>
				</div>
				<DynamicForm :fields="currentFields" :initial="currentSettings" @submit="saveProvider" />
			</div>
		</div>
	</div>
</template>
