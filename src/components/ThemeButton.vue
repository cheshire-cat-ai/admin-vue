<script setup lang="ts">
import { useSettings } from '@stores/useSettings'
import githubLight from 'highlight.js/styles/github.css?raw'
import githubDark from 'highlight.js/styles/github-dark.css?raw'

const store = useSettings()
const { toggleDark } = store
const { isDark } = storeToRefs(store)

const { css } = useStyleTag(isDark.value ? githubDark : githubLight)

watchEffect(() => {
	css.value = isDark.value ? githubDark : githubLight
})
</script>

<template>
	<button class="btn btn-circle btn-ghost swap" @click="toggleDark()">
		<input v-model="isDark" type="checkbox" class="modal-toggle" />
		<heroicons-sun-solid class="swap-on size-6" />
		<heroicons-moon-solid class="swap-off size-6" />
	</button>
</template>
