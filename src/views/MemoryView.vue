<script setup lang="ts">
import { useMemory } from '@stores/useMemory'
import { useSettings } from '@stores/useSettings'
import { JsonTreeView } from 'json-tree-view-vue3'
import SelectBox from '@components/SelectBox.vue'
import Plotly from '@aurium/vue-plotly'
//import { TSNE } from '@keckelt/tsne'
import { Matrix, TSNE, cosine } from "@saehrimnir/druidjs"

const { isDark } = storeToRefs(useSettings())

const callText = ref(''), callOutput = ref('{}'), kMems = ref(10)
const outputAxisX = ref<number[]>([]), outputAxisY = ref<number[]>([]), outputTexts = ref<string[]>([])
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
	const mat = result.episodic //Array.from({ length: 100 }).map(() => Array.from({ length: 1500 }).map(() => Math.random()))
	//const druidMat = Matrix.from(mat.map(v => v.vector))
	/*const scores = mat.map((v, i, k) => {
		const len = k.length
		return v.vector.map(j => {
			const avg = v.vector.reduce((p, c) => p + c) / len
			const dev = Math.sqrt(v.vector.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / len)
			return (j - avg) / dev
		})
	})*/
	/*const tsne = new TSNE({
		epsilon: Math.max(mat.length / 3, 50), // epsilon is learning rate (10 = default)
		perplexity: 5, // roughly how many neighbors each point influences (30 = default)
		dim: 2 // dimensionality of the embedding (2 = default)
	})
	tsne.initDataDist(mat.map(v => v.vector))
	for(let k = 0; k < 1000; k++) {
		tsne.step(); // every time you call this, solution gets better
	}
	const solution = tsne.getSolution() as number[][]*/
	/*const druidTSNE = new TSNE(druidMat, { metric: cosine }).transform().to2dArray
	outputAxisX.value = druidTSNE.map(v => v[0]) as number[]
	outputAxisY.value = druidTSNE.map(v => v[1]) as number[]
	outputTexts.value = result.episodic.map(v => v.page_content)*/
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
			<!--<Plotly :data="[{
				x: outputAxisX,
				y: outputAxisY,
				text: outputTexts,
				type: 'scatter',
				mode: 'markers',
				name: 'Episodic',
				marker: { size: 10 },
			}]" :layout="{
				title: 't-SNE',
				font: {
					family: 'Ubuntu',
					size: 12,
					color: isDark ? '#F4F4F5' : '#383938'
				},
				xaxis: { color: isDark ? '#F4F4F5' : '#383938' },
				yaxis: { color: isDark ? '#F4F4F5' : '#383938' },
				paper_bgcolor: isDark ? '#383938' : '#F4F4F5',
				plot_bgcolor: isDark ? '#383938' : '#F4F4F5',
				showlegend: false,
				margin: { b: 40, l: 40, t: 40, r: 40 }
			}" :displayModeBar="false" />-->
			<JsonTreeView :data="callOutput" rootKey="result" :colorScheme="isDark ? 'dark' : 'light'" />
		</div>
	</div>
</template>

<style lang="scss">
.json-view-item.root-item .value-key {
	white-space: normal !important;
}
</style>

