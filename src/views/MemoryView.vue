<script setup lang="ts">
import { useMemory } from '@stores/useMemory'
import { useSettings } from '@stores/useSettings'
import { JsonTreeView } from 'json-tree-view-vue3'
import SelectBox from '@components/SelectBox.vue'

const { isDark } = storeToRefs(useSettings())

const callText = ref(''), callOutput = ref(''), kMems = ref(5)
const selectCollection = ref<InstanceType<typeof SelectBox>>()

const { wipeAllCollections, wipeCollection, callMemory } = useMemory()

watch(kMems, () => {
	if (typeof kMems.value === 'string') {
		kMems.value = 5
	}
})

const wipeMemory = () => {
	if (selectCollection.value) {
		const selected = selectCollection.value.selectedElement.value
		if (selected === 'all') wipeAllCollections()
		else wipeCollection(selected)
	}
}

const recallMemory = async () => {
	if (callText.value === '') {
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
		<div class="join w-fit self-center shadow-xl">
			<button class="btn-error join-item btn" @click="wipeMemory()">
				Wipe
			</button>
			<SelectBox ref="selectCollection" class="join-item min-w-fit bg-base-100"
				:list="[
					{ label: 'All', value: 'all' },
					{ label: 'Episodic', value: 'episodic' },
					{ label: 'Declarative', value: 'declarative' }
				]" />
		</div>
		<div class="flex gap-4">
			<div class="form-control w-full">
				<label class="label">
					<span class="label-text font-medium text-primary">Recall text</span>
				</label>
				<div class="relative w-full">
					<input v-model.trim="callText" type="text" placeholder="Enter a text..."
						class="input-primary input input-sm w-full" @keyup.enter="recallMemory()">
					<button class="btn-primary btn-square btn-sm btn absolute right-0 top-0"
						@click="recallMemory()">
						<heroicons-magnifying-glass-20-solid class="h-5 w-5" />
					</button>
				</div>
			</div>
			<div class="form-control">
				<label class="label">
					<span class="label-text font-medium text-primary">K memories</span>
				</label>
				<input v-model="kMems" type="number" class="input-primary input input-sm join-item w-24 pl-2 pr-0">
			</div>
		</div>
		<JsonTreeView v-if="callOutput" :data="callOutput" rootKey="result" :colorScheme="isDark ? 'dark' : 'light'" />
	</div>
</template>
