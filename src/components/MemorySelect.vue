<script setup lang="ts">
import { capitalize } from 'lodash'

defineProps<{
	result: any
}>()

const selectedCollection = ref('episodic')
</script>

<template>
	<div class="flex w-full flex-col gap-6 rounded-lg bg-base-200 p-4">
		<div class="flex flex-wrap justify-center gap-2">
			<button v-for="col in Object.keys(result)" :key="col" 
				class=" btn-xs btn rounded-full"
				:class="[ selectedCollection === col ? 'btn-primary text-base-100' : 'btn-ghost !border-2 !border-primary' ]"
				@click="selectedCollection = col">
				{{ col }}
			</button>
		</div>
		<template v-if="result[selectedCollection]?.length > 0">
			<div v-for="(item, value) in result[selectedCollection]" :key="value" 
				class="indicator flex w-full flex-col gap-2 rounded-md bg-base-100 p-2">
				<span class="indicator-center badge badge-success indicator-item font-medium text-base-100">
					{{ item.score }}
				</span> 
				<p class="mt-2">
					{{ item.page_content }}
				</p>
				<div class="flex justify-between gap-2 text-xs font-medium text-primary">
					<p>{{ capitalize(item.metadata.source) }}</p>
					<p>{{ new Date(item.metadata.when * 1000).toLocaleString() }}</p>
				</div>
			</div>
		</template>
		<p v-else class="text-center font-medium">
			No <span class="text-primary">{{ selectedCollection }}</span> memories were used.
		</p>
	</div>
</template>
