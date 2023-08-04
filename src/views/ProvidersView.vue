<script setup lang="ts">
import { type JSONSettings, type SchemaField, InputType } from '@models/JSONSchema'
import { useLLMConfig } from '@stores/useLLMConfig'
import type { JsonSchema } from 'ccat-api'
import SelectBox from '@components/SelectBox.vue'

const storeLLM = useLLMConfig()
const { getAvailableProviders, getProviderSchema, setProviderSettings, getProviderSettings } = storeLLM
const { currentState: llmState } = storeToRefs(storeLLM)

const selectProvider = ref<InstanceType<typeof SelectBox>>()
const currentSchema = ref<JsonSchema>()
const currentSettings = ref<JSONSettings>({})
const currentFields = ref<SchemaField[]>([])

const emit = defineEmits<{
	(e: 'close'): void
}>()

const updateProperties = (selected = currentSchema.value?.title) => {
	currentSchema.value = getProviderSchema(selected)
	currentFields.value = Object.entries(currentSchema.value?.properties ?? {}).map<SchemaField>(([key, value]) => {
		return {
			name: key,
			as: 'input',
			label: value.title,
			type: InputType[value.type as keyof typeof InputType],
			rules: value.default !== undefined ? '' : 'required',
			default: value.default
		}
	})
	currentSettings.value = getProviderSettings(selected)
}

const saveProvider = async (payload: JSONSettings) => {
	const llmName = selectProvider.value?.selectedElement
	if (!llmName?.value) return
	const res = await setProviderSettings(llmName.value, payload)
	if (res) emit('close')
}

const lastTimeUpdated = computed(() => {
	const dateString = llmState.value.data?.settings.find(v => v.name === currentSchema.value?.title)?.updated_at
	if (dateString) return new Date(dateString * 1000).toLocaleString()
	else return 'Never'
})

onMounted(() => {
	updateProperties(selectProvider.value?.selectedElement?.value)
})

watchDeep(llmState, () => {
	updateProperties(selectProvider.value?.selectedElement?.value)
}, { immediate: true })
</script>

<template>
	<div class="flex grow flex-col gap-4">
		<div v-if="llmState.loading" class="flex grow items-center justify-center">
			<span class="loading loading-spinner w-12 text-primary" />
		</div>
		<div v-else-if="llmState.error || !getAvailableProviders().length" 
			class="flex grow items-center justify-center">
			<div class="rounded-md bg-error p-4 font-bold text-base-100 shadow-xl">
				{{ llmState.error }}
			</div>
		</div>
		<div v-else class="flex grow flex-col gap-4">
			<SelectBox ref="selectProvider" :picked="llmState.selected"
				:list="getAvailableProviders().map(p => ({ label: p.name_human_readable ?? p.title, value: p.title }))"
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
