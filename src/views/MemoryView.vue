<script setup lang="ts">
import { useMemory } from '@stores/useMemory'

const { wipeCollections, wipeConversation } = useMemory()
</script>

<template>
	<div class="flex flex-col gap-8 self-center md:w-3/4">
		<div class="flex flex-col items-center justify-center gap-3 rounded-md p-6">
			<p class="text-3xl font-bold text-primary">
				Memory (coming soon)
			</p>
		</div>
		<div class="flex grow justify-between gap-4">
			<button class="btn-error btn" @click="wipeCollections">
				Wipe entire memory
			</button>
			<button class="btn-error btn" @click="wipeConversation">
				Wipe current conversation
			</button>
		</div>
	</div>
</template>
