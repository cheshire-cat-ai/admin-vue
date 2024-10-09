<script setup lang="ts">
import { useMainStore } from '@stores/useMainStore'
import githubLight from 'highlight.js/styles/github.css?raw'
import githubDark from 'highlight.js/styles/github-dark.css?raw'

const store = useMainStore()
console.log('jwtPayload store', store.jwtPayload)
console.log('cookie store', store.cookie)
console.log('document cookie', document.cookie)
const { toggleDark } = store
const { logoutCurrentUser } = store
const { isDark } = storeToRefs(store)
const { css } = useStyleTag(isDark.value ? githubDark : githubLight)

watchEffect(() => {
	css.value = isDark.value ? githubDark : githubLight
})
</script>

<template>
    <div class="dropdown dropdown-bottom">
    <button class="btn btn-circle btn-primary shadow-lg">
      <heroicons-user-solid class="size-6" />
    </button>
      <ul tabindex="0" class="text-sm dropdown-content join join-vertical !right-0 z-10 mt-6 w-48 p-0">
        <li>
          <button
					class="btn join-item w-full flex-nowrap px-2 text-left font-small opacity-100 pointer-events-none cursor-not-allowed">
					<span class="grow text-left">Signed in as</span>
          <span class="grow text-right text-primary">
            {{ store.jwtPayload?.username }}
          </span>
          </button>
        </li>
        <li>
          <button
					class="btn join-item w-full flex-nowrap px-2 text-left font-small"
          @click="toggleDark()">
					<span class="grow text-left">
            Change Theme
          </span>
          <span class="rounded-lg p-1">
						<ThemeButton />
					</span>
          </button>
        </li>
        <li>
          <button
					class="btn join-item w-full flex-nowrap px-2 text-left font-small"
          @click="logoutCurrentUser()">
					<span class="grow text-left">
            Logout
          </span>
          <span class="rounded-lg p-1">
						<Logout />
					</span>
          </button>
        </li>
      </ul>
    </div>
</template>
