<script setup lang="ts">
import { useMemory } from '@stores/useMemory'
import { useSettings } from '@stores/useSettings'
import { JsonTreeView } from 'json-tree-view-vue3'
import SelectBox from '@components/SelectBox.vue'
import Plotly from '@aurium/vue-plotly'
import { Matrix, TSNE, cosine } from "@saehrimnir/druidjs"

interface PlotData {
	name: string
	x: number[]
	y: number[]
	text: string[]
}

const { isDark } = storeToRefs(useSettings())

const callText = ref(''), callOutput = ref('{}'), kMems = ref(10)
const plotOutput = ref<PlotData[]>([])
const selectCollection = ref<InstanceType<typeof SelectBox>>()

const { wipeAllCollections, wipeCollection, callMemory } = useMemory()

watch(kMems, () => {
	if (typeof kMems.value === 'string') {
		kMems.value = 1
	}
})

const wipeMemory = () => {
	if (selectCollection.value) {
		const selected = selectCollection.value.selectedElement?.value
		if (selected === 'all') wipeAllCollections()
		else if (selected) wipeCollection(selected)
	}
}

const recallMemory = async () => {
	if (callText.value === '') {
		callText.value = ' '
	}

	const result = await callMemory(callText.value, kMems.value)
	callOutput.value = JSON.stringify(result)

	const episodicMat = Matrix.from(result.episodic.map(v => v.vector))
	const episodicTSNE = new TSNE(episodicMat, { metric: cosine }).transform().to2dArray

	const declarativeMat = Matrix.from(result.declarative.map(v => v.vector))
	const declarativeTSNE = new TSNE(declarativeMat).transform().to2dArray

	plotOutput.value.push(...[
		{
			name: 'Recalled',
			x: [0.001],
			y: [0.001],
			text: [callText.value]
		},
		{
			name: 'Episodic',
			x: episodicTSNE.map(v => v[0]),
			y: episodicTSNE.map(v => v[1]),
			text: result.episodic.map(v => v.page_content)
		},
		{
			name: 'Declarative',
			x: declarativeTSNE.map(v => v[0]),
			y: declarativeTSNE.map(v => v[1]),
			text: result.declarative.map(v => v.page_content)
		}
	])
}

const getPlotData = computed(() => {
	return plotOutput.value.map(plot => {
		return {
			...plot,
			type: 'scatter',
			mode: 'markers',
			marker: { size: 10 },
		}
	})
})
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
			<SelectBox ref="selectCollection" class="join-item min-w-fit bg-base-200"
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
				<input v-model="kMems" type="number" min="1" class="input-primary input input-sm join-item w-24 pl-2 pr-0">
			</div>
		</div>
		<div v-if="callOutput != '{}'" class="flex flex-wrap justify-center gap-4">
			<Plotly :data="getPlotData" :layout="{
				title: 't-SNE output',
				font: {
					family: 'Ubuntu',
					size: 12,
					color: isDark ? '#F4F4F5' : '#383938'
				},
				xaxis: { color: isDark ? '#F4F4F5' : '#383938' },
				yaxis: { color: isDark ? '#F4F4F5' : '#383938' },
				paper_bgcolor: isDark ? '#383938' : '#F4F4F5',
				plot_bgcolor: isDark ? '#383938' : '#F4F4F5',
				showlegend: true,
				margin: { b: 40, l: 40, t: 40, r: 40 }
			}" :displayModeBar="false" />
			<JsonTreeView :data="callOutput" rootKey="result" :colorScheme="isDark ? 'dark' : 'light'" />
		</div>
	</div>
</template>

<style lang="scss">
.json-view-item.root-item .value-key {
	white-space: normal !important;
}
</style>

