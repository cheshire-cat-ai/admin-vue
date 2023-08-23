<script setup lang="ts">
import { type JSONSettings, type SchemaField } from '@models/JSONSchema'
import { useLLMConfig } from '@stores/useLLMConfig'
import type { JsonSchema } from 'ccat-api'
import { generateVeeObject } from '@utils/schema'

const storeLLM = useLLMConfig()
const { getProviderSchema, setProviderSettings, getProviderSettings } = storeLLM
const { currentState: llmState, getAvailableProviders } = storeToRefs(storeLLM)

const selectedProvider = ref(llmState.value.selected)
const currentSchema = ref<JsonSchema>()
const currentSettings = ref<JSONSettings>({})
const currentFields = ref<SchemaField[]>([])

const emit = defineEmits<{
	(e: 'close'): void
}>()

const updateProperties = (selected = currentSchema.value?.title) => {
	selectedProvider.value = selected
	currentSchema.value = getProviderSchema(selected)
	currentFields.value = generateVeeObject(currentSchema.value?.properties ?? {}, currentSchema.value?.definitions ?? {})
	currentSettings.value = getProviderSettings(selected)
}

const saveProvider = async (payload: JSONSettings) => {
	if (!selectedProvider.value) return
	const res = await setProviderSettings(selectedProvider.value, payload)
	if (res) emit('close')
}

watchDeep(
	llmState,
	() => {
		updateProperties(llmState.value.selected)
	},
	{ immediate: true },
)
</script>

<template>
	<div class="flex grow flex-col gap-4">
		<ErrorBox v-if="llmState.loading || llmState.error" :load="llmState.loading" :error="llmState.error" />
		<div v-else class="flex grow flex-col gap-4">
			<SelectBox
				v-model="selectedProvider"
				:list="getAvailableProviders.map(p => ({ label: p.humanReadableName ?? p.title, value: p.title }))"
				@update="e => updateProperties(e.value)" />
			<div class="flex grow flex-col gap-4">
				<div class="flex items-center gap-1 font-medium">
					<a
						v-if="currentSchema?.link"
						:href="currentSchema.link"
						target="_blank"
						class="btn btn-circle btn-primary btn-xs">
						<heroicons-link-20-solid class="h-4 w-4" />
					</a>
					<span>{{ currentSchema?.description }}</span>
				</div>
				<DynamicForm :fields="currentFields" :initial="currentSettings" @submit="saveProvider" />
			</div>
		</div>
	</div>
</template>
