<script setup lang="ts">
defineProps<{
	result: Record<string, any>
}>()

const selectedCollection = ref('episodic')
</script>

<template>
	<div class="flex w-full flex-col gap-6 rounded bg-base-100 p-4 shadow">
		<div class="flex flex-wrap justify-center gap-4">
			<button
				v-for="col in Object.keys(result)"
				:key="col"
				class="btn-ghost btn-sm inline-flex items-center gap-2 rounded font-semibold capitalize transition-colors hover:bg-primary hover:text-base-100"
				:class="[selectedCollection === col ? 'bg-primary text-base-100' : 'text-primary']"
				@click="selectedCollection = col">
				<ph-chats v-if="col == 'episodic'" class="size-5" />
				<ph-files v-if="col == 'declarative'" class="size-5" />
				<ph-toolbox v-if="col == 'procedural'" class="size-5" />
				{{ col }}
			</button>
		</div>
		<div class="divider !my-0" />
		<template v-if="result[selectedCollection]?.length > 0">
			<div
				v-for="(item, value) in result[selectedCollection]"
				:key="value"
				class="indicator flex w-full flex-col gap-2 rounded bg-base-200 px-2 pb-2">
				<div
					class="indicator-item indicator-center tooltip before:rounded-lg before:font-medium before:text-base-100"
					:data-tip="item.score">
					<span class="badge badge-neutral cursor-pointer font-medium text-base-100">
						{{ Math.floor(item.score * 1000) / 1000 }}
					</span>
				</div>
				<p class="-mt-3 text-sm">
					{{ item.metadata.docstring ? `${item.metadata.docstring}` : item.page_content }}
				</p>
				<div class="flex items-end justify-between gap-2 text-xs font-bold text-neutral/70">
					<p class="truncate">{{ item.metadata.source }} {{ item.metadata.name ? `(${item.metadata.name})` : '' }}</p>
					<p class="whitespace-nowrap">{{ new Date(item.metadata.when * 1000).toLocaleString() }}</p>
				</div>
			</div>
		</template>
		<p v-else class="text-center text-sm font-medium">
			No <span class="font-bold">{{ selectedCollection }}</span> memories were used.
		</p>
	</div>
</template>
