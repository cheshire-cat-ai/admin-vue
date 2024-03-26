<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		label?: string
		placeholder?: string
		disabled?: boolean
		search?: boolean
		autofocus?: boolean
		error?: string
	}>(),
	{
		disabled: false,
		search: false,
		autofocus: true,
		label: '',
		placeholder: '',
		error: '',
	},
)

const model = defineModel<string>({ required: true })

const inputBox = ref<HTMLInputElement>()
const { autofocus } = toRefs(props)

onActivated(() => {
	if (autofocus.value) inputBox.value?.focus()
})

defineEmits<{
	send: []
}>()
</script>

<template>
	<div class="form-control w-full">
		<label v-if="label" class="label px-0">
			<span class="label-text font-semibold">{{ label }}</span>
		</label>
		<div class="relative w-full">
			<input
				ref="inputBox"
				v-model="model"
				type="text"
				:placeholder="placeholder"
				:disabled="disabled"
				:autofocus="autofocus"
				class="input input-sm input-primary w-full shadow-lg !outline-2 !transition-all"
				@keyup.enter="$emit('send')" />
			<button v-if="search" class="btn btn-square btn-ghost btn-sm absolute right-0 top-0" :disabled="disabled" @click="$emit('send')">
				<heroicons-magnifying-glass-20-solid class="size-5" />
			</button>
		</div>
		<label v-if="error" class="label">
			<span class="label-text font-medium text-error">{{ error }}</span>
		</label>
	</div>
</template>
