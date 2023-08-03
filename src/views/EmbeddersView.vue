<script setup lang="ts">
import { useEmbedderConfig } from '@stores/useEmbedderConfig'
import type { JSONSettings } from '@models/JSONSchema'
import type { JsonSchema } from 'ccat-api'
import SelectBox from '@components/SelectBox.vue'

const storeEmbedder = useEmbedderConfig()
const { getAvailableEmbedders, getEmbedderSchema, getEmbedderSettings, setEmbedderSettings } = storeEmbedder
const { currentState: embedderState } = storeToRefs(storeEmbedder)

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

const lastTimeUpdated = computed(() => {
	const dateString = embedderState.value.data?.settings.find(v => v.name === currentSchema.value?.title)?.updated_at
	if (dateString) return new Date(dateString * 1000).toLocaleString()
	else return 'Never'
})

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
			<button class="btn btn-success btn-sm mt-auto normal-case" 
				:disabled="!requiredFilled" @click="saveEmbedder">
				Save
			</button>
		</div>
	</div>
</template>
