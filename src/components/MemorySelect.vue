<script setup lang="ts">
import { capitalize } from 'lodash'

defineProps<{
	result: any
}>()

const selectedCollection = ref('episodic')
</script>

<template>
	<div class="flex w-full flex-col gap-6 rounded shadow bg-base-100 p-4">
		<div class="flex flex-wrap justify-center gap-4">
			<button
				v-for="col in Object.keys(result)"
				:key="col"
				class="btn-ghost inline-flex items-center gap-2 btn-sm rounded font-semibold capitalize hover:bg-primary hover:text-base-100"
				:class="[selectedCollection === col ? 'bg-primary text-base-100' : 'text-primary']"
				@click="selectedCollection = col">
				<ph-chats v-if="col == 'episodic'" class="h-5 w-5" />
				<ph-files v-if="col == 'declarative'" class="h-5 w-5" />
				<ph-toolbox v-if="col == 'procedural'" class="h-5 w-5" />
				{{ col }}
			</button>
		</div>
		<div class="divider !my-0" />
		<template v-if="result[selectedCollection]?.length > 0">
			<div
				v-for="(item, value) in result[selectedCollection]"
				:key="value"
				class="indicator flex w-full flex-col gap-2 rounded bg-base-200/30 py-4 px-2">
				<span class="indicator-center badge indicator-item badge-neutral font-medium text-base-100">
					{{ item.score }}
				</span>
				<p class="mt-1 text-sm">
					{{ item.metadata.docstring ? `${item.metadata.docstring}` : item.page_content }}
				</p>
				<div class="flex justify-between gap-2 text-xs font-bold text-neutral/70">
					<p>{{ capitalize(item.metadata.source) }} {{ item.metadata.name ? `(${item.metadata.name})` : '' }}</p>
					<p>{{ new Date(item.metadata.when * 1000).toLocaleString() }}</p>
				</div>
			</div>
		</template>
		<p v-else class="text-center font-medium text-sm">
			No <span class="font-bold">{{ selectedCollection }}</span> memories were used.
		</p>
	</div>
</template>
