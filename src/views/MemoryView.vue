<script setup lang="ts">
import _ from 'lodash'
import download from 'downloadjs'
import { useMemory } from '@stores/useMemory'
import { useSettings } from '@stores/useSettings'
import { JsonTreeView } from 'json-tree-view-vue3'
import SelectBox from '@components/SelectBox.vue'
import Plotly from '@aurium/vue-plotly'
import { now } from '@utils/commons'
import { Matrix, TSNE } from '@saehrimnir/druidjs'
import SidePanel from '@components/SidePanel.vue'
import type { VectorsData } from '@models/Memory'

interface PlotData {
	name: string
	x: number[]
	y: number[]
	text: string[]
	customdata?: object[]
}

const { isDark } = storeToRefs(useSettings())

const callText = ref(''), callOutput = ref('{}'), kMems = ref(10)
const plotOutput = ref<PlotData[]>([]), clickedPoint = ref()
const sidePanel = ref<InstanceType<typeof SidePanel>>()
const selectCollection = ref<InstanceType<typeof SelectBox>>()

const [showSpinner, toggleSpinner] = useToggle(false)

const memoryStore = useMemory()
const { currentState: memoryState } = storeToRefs(memoryStore)
const { wipeAllCollections, wipeCollection, callMemory, fetchCollections } = memoryStore

/**
 * If "all", wipes all the collections in memory, otherwise only the selected one
 */
const wipeMemory = async () => {
	if (selectCollection.value) {
		const selected = selectCollection.value.selectedElement?.value
		if (!selected) return
		if (selected === 'all') await wipeAllCollections()
		else await wipeCollection(selected)
		await fetchCollections()
	}
}

/**
 * Merges and reduces the matrices to a new matrix that can be plotted in a 2d graph
 * @param perplexity the perplexity to pass in the t-SNE algorithm
 * @param iterations the number of interations to make to increase the precision of the algorithm
 * @param mats the matrices to pass to the algorithm
 */
const reduceTo2d = (options: ConstructorParameters<typeof TSNE>['1'], iterations: number, ...mats: number[][][]) => {
    const matrix = _.map(_.omitBy(mats, _.isEmpty), v => Matrix.from(v))
    const tsne = new TSNE(matrix.reduce((p, c) => p.concat(c, "vertical")), options).transform(iterations)
	return tsne instanceof Matrix ? tsne.to2dArray : tsne
}

/**
 * Creates the plot data that can be shown in the graph
 * @param jsonResult the Memory object to use for the plot
 * @param mats additional matrices to concatenate in the reduction
 */
const showMemoryPlot = (jsonResult: VectorsData['collections'], ...mats: number[][]) => {
	const collectionsLengths = _.reduce(jsonResult, (a, v, k) => ({ ...a, [k]: v.length }), {}) as Record<string, number>

	const maxPerplexity = _.reduce(_.values(collectionsLengths), (p, c) => p + (c as number), 0)

	const matrix = reduceTo2d({ 
		perplexity: Math.min(Math.max(kMems.value, 2), maxPerplexity) 
	}, 1000, ..._.map(jsonResult, (v) => _.map(v, c => c.vector)), mats)

	return {
		matrix,
		data: _.map(_.entries(jsonResult), (c, i, k) => {
			const prev = i > 0 ? k[i - 1][1].length : 0
			const curr = c[1].length
			return {
				name: _.capitalize(c[0]),
				x: matrix.slice(prev, prev + curr).map(m => m[0]),
				y: matrix.slice(prev, prev + curr).map(m => m[1]),
				text: c[1].map(v => v.page_content.substring(0, 30).concat('...')),
				customdata: c[1].map(v => {
					return {
						text: v.page_content,
						source: v.metadata.source,
						when: new Date(v.metadata.when * 1000).toLocaleString(),
						score: v.score
					}
				})
			}
		}) as PlotData[]
	}
}

/**
 * Recall the k memory vectors related to the query passed
 */
const recallMemory = async () => {
	if (callText.value === '') {
		callText.value = ' '
	}

	if (typeof kMems.value === 'string' || kMems.value === 0) {
		kMems.value = 10
	}

	toggleSpinner()

	const result = await callMemory(callText.value, kMems.value)

	if (!result) {
		toggleSpinner()
		return
	}

	const memoryPlot = showMemoryPlot(result.vectors.collections, result.query.vector)

	plotOutput.value = memoryPlot.data

	plotOutput.value.push({
		name: 'Query',
		x: memoryPlot.matrix.slice(-1).map(v => v[0]),
		y: memoryPlot.matrix.slice(-1).map(v => v[1]),
		text: [callText.value.substring(0, 30).concat('...')],
		customdata: [{ text: callText.value, source: 'query', when: 'now', score: 1 }]
	})

	callOutput.value = JSON.stringify(result.vectors, undefined, 2)

	toggleSpinner()
}

/**
 * Computed function to create the array of data to insert in the plot
 */
const getPlotData = computed(() => {
	return plotOutput.value.map(plot => {
		return {
			...plot,
			type: 'scatter',
			mode: 'markers',
			hovertemplate: `
<i>%{text}</i><br>
<b><i>*Click to show more*</i></b>
<extra></extra>
			`,
			marker: { size: 10 },
		}
	})
})

const getSelectCollections = computed(() => {
	const data = memoryState.value.data ?? []
	const totalCollections = data.map(v => v.vectors_count).reduce((p, c) => p + c, 0)
	if (selectCollection.value?.selectedElement?.value === 'all') {
		selectCollection.value.selectedElement.label = `All (${totalCollections})`
	}
	return [
		{ label: `All (${totalCollections})`, value: 'all' },
		...data.map(v => ({ label: `${_.capitalize(v.name)} (${v.vectors_count})`, value: v.name }))
	]
})

const onPointClick = (data: any) => {
	clickedPoint.value = data.points[0]
	sidePanel.value?.togglePanel()
}

const downloadResult = () => {
	const output = { export_time: now() }
	_.assign(output, JSON.parse(callOutput.value))
	download(JSON.stringify(output, undefined, 2), 'result.json', 'application/json')
}
</script>

<template>
	<div class="flex w-full flex-col gap-8 self-center md:w-3/4">
		<div class="flex flex-col items-center justify-center gap-3 rounded-md p-6">
			<p class="text-3xl font-bold text-primary">
				Memory
			</p>
		</div>
		<div class="join w-fit self-center shadow-xl">
			<button :disabled="memoryState.error !== undefined" class="btn-error join-item btn" @click="wipeMemory()">
				Wipe
			</button>
			<SelectBox ref="selectCollection" class="join-item min-w-fit bg-base-200 p-1" :list="getSelectCollections" />
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
		<div v-if="showSpinner" class="flex grow items-center justify-center">
			<span class="loading loading-spinner w-12 text-primary" />
		</div>
		<div v-else-if="memoryState.error" class="flex grow items-center justify-center">
			<p class="w-fit rounded bg-error p-4 font-semibold text-base-100">
				{{ memoryState.error }}
			</p>
		</div>
		<div v-else-if="!showSpinner && !memoryState.error && callOutput != '{}'" class="flex flex-col items-center justify-center gap-4">
			<Plotly :data="getPlotData" :layout="{
					title: 'Similar memories',
					font: {
						family: 'Ubuntu',
						size: 12,
						color: isDark ? '#F4F4F5' : '#383938'
					},
					autosize: true,
					xaxis: { color: isDark ? '#F4F4F5' : '#383938', showticklabels: false, automargin: true },
					yaxis: { color: isDark ? '#F4F4F5' : '#383938', showticklabels: false, automargin: true },
					paper_bgcolor: isDark ? '#383938' : '#F4F4F5',
					plot_bgcolor: isDark ? '#383938' : '#F4F4F5',
					showlegend: true,
					legend: { x: 0, xanchor: 'right', title: { text: 'Collections' } },
					margin: { b: 30, l: 30, t: 30, r: 30 }
				}" :modeBarButtonsToRemove="['zoom2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'resetScale2d']"
				:toImageButtonOptions="{
					format: 'jpeg',
					filename: 'recall_plot',
					scale: 1.5
				}"
				:displayModeBar="true" :displaylogo="false" :responsive="true" :scrollZoom="true" @plotly_click="onPointClick" />
			<button class="btn-info btn" @click="downloadResult()">
				Export the result
			</button>
			<JsonTreeView :data="callOutput" rootKey="result" :colorScheme="isDark ? 'dark' : 'light'" />
		</div>
		<SidePanel ref="sidePanel" title="Memory content">
			<div class="overflow-x-auto rounded-md border-2 border-neutral">
				<table class="table-zebra table-sm table">
					<tbody>
						<tr v-for="data in Object.entries(clickedPoint.customdata)" :key="data[0]">
							<td>{{ _.capitalize(data[0]) }}</td>
							<td>{{ data[1] }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</SidePanel>
	</div>
</template>

<style lang="scss">
.json-view-item.root-item .value-key {
	white-space: normal !important;
}

.table tr td:first-child {
	@apply font-medium text-primary;
}
</style>

