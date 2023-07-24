<script setup lang="ts">
import { useSettings } from '@stores/useSettings'

const store = useSettings()
const { toggleDark } = store
const { isDark } = storeToRefs(store)

watchEffect(() => {
	// TODO: Doesn't work, it just imports them and use the latest imported
	if (isDark.value) import("highlight.js/styles/github-dark.css")
	else import("highlight.js/styles/github.css")
})
</script>

<template>
	<button class="btn btn-circle btn-ghost swap" @click="toggleDark()">
		<input v-model="isDark" type="checkbox" class="modal-toggle">
		<heroicons-sun-solid class="swap-on h-6 w-6" />
		<heroicons-moon-solid class="swap-off h-6 w-6" />
	</button>
</template>
