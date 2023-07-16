<script setup lang="ts">
import type { JSONSettings } from '@models/JSONSchema'
import { useLLMConfig } from '@stores/useLLMConfig'
import type { Schema } from 'ccat-api'
import SelectBox from '@components/SelectBox.vue'

const storeLLM = useLLMConfig()
const { getAvailableProviders, getProviderSchema, setProviderSettings, getProviderSettings } = storeLLM
const { currentState: llmState } = storeToRefs(storeLLM)

const selectProvider = ref<InstanceType<typeof SelectBox>>()
const currentSchema = ref<Schema>()
const currentSettings = ref<JSONSettings>({})

const emit = defineEmits<{
	(e: 'close'): void
}>()

const updateProperties = (selected = currentSchema.value?.title) => {
	currentSchema.value = getProviderSchema(selected)
	currentSettings.value = getProviderSettings(selected)
	Object.values(currentSchema.value?.properties ?? {}).forEach(p => {
		if (!p.env_names) return
		if (!currentSettings.value[p.env_names[0]]) currentSettings.value[p.env_names[0]] = p.default
	})
}

const saveProvider = async () => {
	const llmName = selectProvider.value?.selectedElement
	if (!llmName?.value) return
	const res = await setProviderSettings(llmName.value, currentSettings.value)
	if (res) emit('close')
}

const lastTimeUpdated = computed(() => {
	const dateString = llmState.value.data?.settings.find(v => v.name === currentSchema.value?.title)?.updated_at
	if (dateString) return new Date(dateString * 1000).toLocaleString()
	else return 'Never'
})

watchDeep(llmState, () => {
	updateProperties(selectProvider.value?.selectedElement?.value)
}, { flush: 'post', immediate: true })
</script>

<template>
	<div class="flex grow flex-col gap-4">
		<div v-if="llmState.loading" class="flex grow items-center justify-center">
			<span class="loading loading-spinner w-12 text-primary" />
		</div>
		<div v-else-if="llmState.error || !getAvailableProviders().length" 
			class="flex grow items-center justify-center">
			<div class="rounded-md bg-error p-4 font-bold text-base-100 shadow-xl">
				Failed to fetch available LLM providers
			</div>
		</div>
		<div v-else class="flex grow flex-col gap-4">
			<SelectBox ref="selectProvider" :picked="llmState.selected" class="bg-base-200"
				:list="getAvailableProviders().map(p => ({ label: p.name_human_readable, value: p.title }))"
				@update="e => updateProperties(e.value)" />
			<div class="flex flex-col gap-4">
				<div class="flex flex-col">
					<p class="font-medium">
						{{ currentSchema?.description }}
					</p>
					<p class="text-xs text-neutral-focus/75">
						Last time updated:
						{{ lastTimeUpdated }}
					</p>
				</div>
				<div v-for="prop in currentSchema?.properties" :key="prop.title" class="flex flex-col gap-2">
					<p class="text-sm text-neutral-focus">
						<span v-if="!prop.default" class="font-bold text-error">*</span>
						{{ prop.title }}
					</p>
					<input v-model="currentSettings[prop.env_names[0]]" 
						:type="prop.type === 'string' ? 'text' : 'number'" :placeholder="prop.title"
						class="input input-primary input-sm w-full" :class="{ 'pr-0': prop.type !== 'string' }">
				</div>
			</div>
			<button class="btn btn-success btn-sm mt-auto normal-case" @click="saveProvider">
				Save
			</button>
		</div>
	</div>
</template>
