<script setup lang="ts">
import { useMainStore } from '@/stores/useMainStore';

const store = useMainStore()
const { logoutCurrentUser } = store

</script>

<template>
	<button class="opacity-50" @click="logoutCurrentUser()">
    <heroicons-outline:logout class="size-5" />
  </button>
</template>
