<script setup lang="ts">
import { useMainStore } from '@stores/useMainStore'
import githubLight from 'highlight.js/styles/github.css?raw'
import githubDark from 'highlight.js/styles/github-dark.css?raw'

const store = useMainStore()
const { logoutCurrentUser, toggleDark } = store
const { isDark, jwtPayload } = storeToRefs(store)
const { css } = useStyleTag(isDark.value ? githubDark : githubLight)

watchEffect(() => {
	css.value = isDark.value ? githubDark : githubLight
})
</script>

<template>
	<div class="dropdown dropdown-bottom">
		<button class="btn btn-circle btn-ghost">
			<heroicons-user-solid class="size-6" />
		</button>
		<ul tabindex="0" class="dropdown-content join join-vertical !right-0 z-10 mt-6 w-40 p-0 text-sm">
			<li>
				<button class="font-small btn join-item grow flex-col gap-1 items-end pointer-events-none w-full cursor-not-allowed px-2 opacity-100">
					<span class="opacity-60">Signed in as</span> 
					<span>{{ jwtPayload?.username }}</span>
				</button>
			</li>
			<li>
				<button class="font-small btn join-item w-full flex-nowrap px-2 text-left" @click="toggleDark()">
					<span class="grow text-right">Change Theme</span>
					<span class="rounded-lg p-1">
						<button class="swap opacity-50">
							<input v-model="isDark" type="checkbox" class="modal-toggle" />
							<heroicons-sun-solid class="swap-on size-5" />
							<heroicons-moon-solid class="swap-off size-5" />
						</button>
					</span>
				</button>
			</li>
			<li>
				<button class="font-small btn join-item w-full flex-nowrap px-2 text-right" @click="logoutCurrentUser()">
					<span class="grow text-right">Log out</span>
					<span class="rounded-lg p-1">
						<button class="opacity-50" @click="logoutCurrentUser()">
							<heroicons-arrow-right-on-rectangle class="size-5" />
						</button>
					</span>
				</button>
			</li>
		</ul>
	</div>
</template>
