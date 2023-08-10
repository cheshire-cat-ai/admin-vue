<script setup lang="ts">
import { useEmbedderConfig } from '@stores/useEmbedderConfig'
import type { JSONSettings } from '@models/JSONSchema'
import type { JsonSchema } from 'ccat-api'
import SelectBox from '@components/SelectBox.vue'

const storeEmbedder = useEmbedderConfig()
const { getEmbedderSchema, getEmbedderSettings, setEmbedderSettings } = storeEmbedder
const { currentState: embedderState, getAvailableEmbedders } = storeToRefs(storeEmbedder)

const selectEmbedder = ref<InstanceType<typeof SelectBox>>()
const currentSchema = ref<JsonSchema>()
const currentSettings = ref<JSONSettings>({})

const emit = defineEmits<{
	(e: 'close'): void
}>()

const updateProperties = (selected = currentSchema.value?.title) => {
	currentSchema.value = getEmbedderSchema(selected)
	currentSettings.value = getEmbedderSettings(selected)
	Object.values(currentSchema.value?.properties ?? {}).forEach(p => {
		if (!p.env_names) return
		if (!currentSettings.value[p.env_names[0]]) currentSettings.value[p.env_names[0]] = p.default
	})
}

const saveEmbedder = async () => {
	const embName = selectEmbedder.value?.selectedElement
	if (!embName?.value) return
	const res = await setEmbedderSettings(embName.value, currentSettings.value)
	if (res) emit('close')
}

const requiredFilled = computed(() => {
	const requiredFields = currentSchema.value?.required
	if (!requiredFields || requiredFields.length === 0) return true
	else return requiredFields.every(v => currentSettings.value[v])
})

watchDeep(embedderState, () => {
	updateProperties(selectEmbedder.value?.selectedElement?.value)
}, { flush: 'post', immediate: true })
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
				:disabled="!requiredFilled" @click="saveEmbedder">
				Save
			</button>
		</div>
	</div>
</template>
