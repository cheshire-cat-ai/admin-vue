<script setup lang="ts">
withDefaults(
	defineProps<{
		load: boolean
		error?: string
		text?: string
	}>(),
	{
		error: undefined,
		text: 'Getting ready...',
	},
)
</script>

<template>
	<div v-if="load" class="flex grow flex-col items-center justify-center gap-2">
		<span class="loading loading-spinner loading-lg text-primary" />
		<span class="text-lg font-medium text-neutral">{{ text }}</span>
	</div>
	<div v-else-if="error" class="flex grow items-center justify-center">
		<span class="rounded-lg bg-error p-4 font-bold text-base-100 shadow-xl">
			{{ error }}
		</span>
	</div>
</template>
