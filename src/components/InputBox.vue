<script setup lang="ts">
withDefaults(defineProps<{
    modelValue: string,
    disabled?: boolean,
    search?: boolean,
    label?: string,
    placeholder?: string
}>(), {
    disabled: false,
    search: false,
    label: '',
	placeholder: ''
})

defineEmits<{
	(e: 'send'): void,
    (e: 'update:modelValue', payload: string): void
}>()
</script>

<template>
	<div class="form-control w-full">
		<label v-if="label" class="label">
			<span class="label-text font-medium text-primary">{{ label }}</span>
		</label>
		<div class="relative w-full">
			<input :value="modelValue" type="text" :placeholder="placeholder"
				:disabled="disabled" class="input input-primary input-sm w-full !transition-all" 
				@keyup.enter="$emit('send')" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)">
			<button v-if="search" class="btn btn-square btn-primary btn-sm absolute right-0 top-0" 
				:disabled="disabled" @click="$emit('send')">
				<heroicons-magnifying-glass-20-solid class="h-5 w-5" />
			</button>
		</div>
	</div>
</template>
