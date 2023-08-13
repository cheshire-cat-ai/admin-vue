<script setup lang="ts">
import { entries } from 'lodash'
import { type JSONSettings, type SchemaField, InputType } from "@models/JSONSchema"
import { useLLMConfig } from "@stores/useLLMConfig"
import type { JsonSchema } from "ccat-api"

const storeLLM = useLLMConfig()
const { getProviderSchema, setProviderSettings, getProviderSettings } = storeLLM
const { currentState: llmState, getAvailableProviders } = storeToRefs(storeLLM)

const selectedProvider = ref(llmState.value.selected)
const currentSchema = ref<JsonSchema>()
const currentSettings = ref<JSONSettings>({})
const currentFields = ref<SchemaField[]>([])

const emit = defineEmits<{
	(e: "close"): void
}>()

const updateProperties = (selected = currentSchema.value?.title) => {
	selectedProvider.value = selected
	currentSchema.value = getProviderSchema(selected)
	currentFields.value = entries(currentSchema.value?.properties ?? {}).map<SchemaField>(([key, value]) => {
		return {
			name: key,
			as: "input",
			label: value.title,
			type: InputType[value.type as keyof typeof InputType],
			rules: value.default !== undefined ? "" : "required",
			default: value.default,
		}
	})
	currentSettings.value = getProviderSettings(selected)
}

const saveProvider = async (payload: JSONSettings) => {
	if (!selectedProvider.value) return
	const res = await setProviderSettings(selectedProvider.value, payload)
	if (res) emit("close")
}

watchDeep(llmState, () => {
	updateProperties(llmState.value.selected)
}, { immediate: true })
</script>

<template>
	<div class="flex grow flex-col gap-4">
		<ErrorBox v-if="llmState.loading || llmState.error" 
			:load="llmState.loading" :error="llmState.error" />
		<div v-else class="flex grow flex-col gap-4">
			<SelectBox v-model="selectedProvider"
				:list="getAvailableProviders.map(p => ({ label: p.humanReadableName ?? p.title, value: p.title }))"
				@update="e => updateProperties(e.value)" />
			<div class="flex grow flex-col gap-4">
				<p class="font-medium">
					{{ currentSchema?.description }}
				</p>
				<DynamicForm :fields="currentFields" :initial="currentSettings" @submit="saveProvider" />
			</div>
		</div>
	</div>
</template>
