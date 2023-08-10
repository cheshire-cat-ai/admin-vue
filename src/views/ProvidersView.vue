<script setup lang="ts">
import type { JSONSettings } from '@models/JSONSchema'
import { useLLMConfig } from '@stores/useLLMConfig'
import type { JsonSchema } from 'ccat-api'
import SelectBox from '@components/SelectBox.vue'

const storeLLM = useLLMConfig()
const { getProviderSchema, setProviderSettings, getProviderSettings } = storeLLM
const { currentState: llmState, getAvailableProviders } = storeToRefs(storeLLM)

const selectProvider = ref<InstanceType<typeof SelectBox>>()
const currentSchema = ref<JsonSchema>()
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

const requiredFilled = computed(() => {
	const requiredFields = currentSchema.value?.required
	if (!requiredFields || requiredFields.length === 0) return true
	else return requiredFields.every(v => currentSettings.value[v])
})

watchDeep(llmState, () => {
	updateProperties(selectProvider.value?.selectedElement?.value)
}, { flush: 'post', immediate: true })
</script>

<template>
	<div class="flex grow flex-col gap-4">
		<ErrorBox v-if="llmState.loading || llmState.error" 
			:load="llmState.loading" :error="llmState.error" />
		<div v-else class="flex grow flex-col gap-4">
			<SelectBox ref="selectProvider" :picked="llmState.selected"
				:list="getAvailableProviders.map(p => ({ label: p.nameHumanReadable ?? p.title, value: p.title }))"
				@update="e => updateProperties(e.value)" />
			<div class="flex flex-col gap-4">
				<p class="font-medium">
					{{ currentSchema?.description }}
				</p>
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
			<button class="btn btn-success btn-sm mt-auto normal-case" 
				:disabled="!requiredFilled" @click="saveProvider">
				Save
			</button>
		</div>
	</div>
</template>
