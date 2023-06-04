<script setup lang="ts">
import { useMemory } from '@stores/useMemory'

const { wipeCollections, wipeConversation } = useMemory()
</script>

<template>
	<div class="flex flex-col gap-8 self-center md:w-3/4">
		<div class="col-span-2 flex flex-col items-center justify-center gap-3 rounded-md p-6">
			<p class="text-3xl font-bold text-primary">
				Memory (coming soon)
			</p>
		</div>
	</div>
</template>
