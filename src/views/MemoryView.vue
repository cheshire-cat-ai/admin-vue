<script setup lang="ts">
import { useMemory } from '@stores/useMemory'
import { useSettings } from '@stores/useSettings'
import { JsonTreeView } from 'json-tree-view-vue3'

const { isDark } = storeToRefs(useSettings())

const callText = ref(''), callOutput = ref(''), kMems = ref(5)

const { wipeAllCollections, wipeConversation, wipeCollection, callMemory } = useMemory()

watch(kMems, () => {
	if (typeof kMems.value === 'string') {
		kMems.value = 5
	}
})

const recallMemory = async () => {
	if(callText.value === ''){
		callText.value = ' '
	}
	const result = await callMemory(callText.value, kMems.value)
	callOutput.value = JSON.stringify(result)
}
</script>

<template>
	<div class="flex flex-col gap-8 self-center md:w-3/4">
		<div class="flex flex-col items-center justify-center gap-3 rounded-md p-6">
			<p class="text-3xl font-bold text-primary">
				Memory
			</p>
		</div>
		<div class="flex flex-wrap justify-around gap-4">
			<button class="btn-error btn" @click="wipeAllCollections">
				Wipe entire memory
			</button>
			<button class="btn-error btn" @click="wipeConversation">
				Wipe current conversation
			</button>
		</div>
		<div class="flex gap-4">
			<div class="relative w-full">
				<input v-model.trim="callText" type="text" placeholder="Recall text..."
					class="input-primary input input-sm w-full" @keyup.enter="recallMemory()">
				<button class="btn-primary btn-square btn-sm btn absolute right-0 top-0"
					@click="recallMemory()">
					<heroicons-magnifying-glass-20-solid class="h-5 w-5" />
				</button>
			</div>
			<input v-model="kMems" type="number" class="input-primary input input-sm w-16 pl-2 pr-0">
		</div>
		<JsonTreeView v-if="callOutput" :data="callOutput" rootKey="result" :colorScheme="isDark ? 'dark' : 'light'" />
	</div>
</template>
