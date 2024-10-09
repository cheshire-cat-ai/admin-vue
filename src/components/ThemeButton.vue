<script setup lang="ts">
import { useMainStore } from '@stores/useMainStore'
import githubLight from 'highlight.js/styles/github.css?raw'
import githubDark from 'highlight.js/styles/github-dark.css?raw'

const store = useMainStore()
const { isDark } = storeToRefs(store)

const { css } = useStyleTag(isDark.value ? githubDark : githubLight)

watchEffect(() => {
	css.value = isDark.value ? githubDark : githubLight
})
</script>

<template>
	<button class="swap opacity-50">
		<input v-model="isDark" type="checkbox" class="modal-toggle" />
		<heroicons-sun-solid class="swap-on size-5" />
		<heroicons-moon-solid class="swap-off size-5" />
	</button>
</template>
