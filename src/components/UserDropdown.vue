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
    <button class="btn btn-circle btn-ghost">
      <heroicons-user-solid class="size-6" />
    </button>
      <ul tabindex="0" class="text-sm dropdown-content join join-vertical !right-0 z-10 mt-6 w-48 p-0">
        <li>
          <button
					class="btn join-item w-full flex-nowrap px-2 text-left font-small opacity-100 pointer-events-none cursor-not-allowed">
          <span class="grow text-right">
            <span class="opacity-60">Signed in as</span> {{ store.jwtPayload?.username }}
          </span>
          </button>
        </li>
        <li>
          <button
					class="btn join-item w-full flex-nowrap px-2 text-left font-small"
          @click="toggleDark()">
					<span class="grow text-right">
            Change Theme
          </span>
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
          <button
					class="btn join-item w-full flex-nowrap px-2 text-right font-small"
          @click="logoutCurrentUser()">
					<span class="grow text-right">
            Logout
          </span>
          <span class="rounded-lg p-1">
            <button class="opacity-50" @click="logoutCurrentUser()">
              <heroicons-outline:logout class="size-5" />
            </button>
					</span>
          </button>
        </li>
      </ul>
    </div>
</template>
