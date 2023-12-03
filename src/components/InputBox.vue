<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		modelValue: string
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

const inputBox = ref<HTMLInputElement>()
const { autofocus } = toRefs(props)

onActivated(() => {
	if (autofocus.value) inputBox.value?.focus()
})

defineEmits<{
	(e: 'send'): void
	(e: 'update:modelValue', payload: string): void
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
				:value="modelValue"
				type="text"
				:placeholder="placeholder"
				:disabled="disabled"
				:autofocus="autofocus"
				class="input input-primary input-sm w-full shadow-lg !outline-2 !transition-all"
				@keyup.enter="$emit('send')"
				@input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
			<button v-if="search" class="btn btn-square btn-ghost btn-sm absolute right-0 top-0" :disabled="disabled" @click="$emit('send')">
				<heroicons-magnifying-glass-20-solid class="h-5 w-5" />
			</button>
		</div>
		<label v-if="error" class="label">
			<span class="label-text font-medium text-error">{{ error }}</span>
		</label>
	</div>
</template>
