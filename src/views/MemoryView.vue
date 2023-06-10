<script setup lang="ts">
import _ from 'lodash'
import download from 'downloadjs'
import { useMemory } from '@stores/useMemory'
import { useSettings } from '@stores/useSettings'
import { JsonTreeView } from 'json-tree-view-vue3'
import SelectBox from '@components/SelectBox.vue'
import Plotly from '@aurium/vue-plotly'
import { Matrix, TSNE } from "@saehrimnir/druidjs"
import SidePanel from '@components/SidePanel.vue'

interface PlotData {
	name: string
	x: number[]
	y: number[]
	text: string[]
	customdata?: (string | object)[]
}

const { isDark } = storeToRefs(useSettings())

const callText = ref(''), callOutput = ref('{}'), kMems = ref(10), currentError = ref('')
const plotOutput = ref<PlotData[]>([]), clickedPoint = ref()
const sidePanel = ref<InstanceType<typeof SidePanel>>()
const selectCollection = ref<InstanceType<typeof SelectBox>>()

const [showSpinner, toggleSpinner] = useToggle(false)

const { wipeAllCollections, wipeCollection, callMemory } = useMemory()

/**
 * If "all", wipes all the collections in memory, otherwise only the selected one
 */
const wipeMemory = () => {
	if (selectCollection.value) {
		const selected = selectCollection.value.selectedElement?.value
		if (selected === 'all') wipeAllCollections()
		else if (selected) wipeCollection(selected)
	}
}

/**
 * Transforms the vectors in a 2D array to plot
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

	if (typeof result === 'string') {
		currentError.value = result
		toggleSpinner()
		return
	}

	const queryMat = Matrix.from(result.query)
	const episodicMat = Matrix.from(result.episodic.map(v => v.vector))
	const declarativeMat = Matrix.from(result.declarative.map(v => v.vector))

	const druidTSNE = new TSNE(
		episodicMat
		.concat(declarativeMat, "vertical")
		.concat(queryMat, "vertical"), {
		perplexity: Math.min(Math.max(kMems.value, 2), result.episodic.length + result.declarative.length)
	}).transform(1000).asArray
	
	plotOutput.value = [
		{
			name: 'Query',
			x: druidTSNE.slice(-1).map(v => v[0]),
			y: druidTSNE.slice(-1).map(v => v[1]),
			text: [callText.value],
			customdata: [{ source: 'query', when: 'now', score: 1 }]
		},
		{
			name: 'Episodic',
			x: druidTSNE.slice(0, episodicMat.shape[0]).map(v => v[0]),
			y: druidTSNE.slice(0, episodicMat.shape[0]).map(v => v[1]),
			text: result.episodic.map(v => v.page_content),
			customdata: result.episodic.map((v) => {
				return {
					source: v.metadata.source,
					when: new Date(v.metadata.when * 1000).toLocaleString(),
					score: v.score
				}
			})
		},
		{
			name: 'Declarative',
			x: druidTSNE.slice(episodicMat.shape[0], druidTSNE.length - 1).map(v => v[0]),
			y: druidTSNE.slice(episodicMat.shape[0], druidTSNE.length - 1).map(v => v[1]),
			text: result.declarative.map(v => v.page_content),
			customdata: result.declarative.map((v) => {
				return {
					source: v.metadata.source,
					when: new Date(v.metadata.when * 1000).toLocaleString(),
					score: v.score
				}
			})
		}
	]

	//const filteredResult = _.cloneDeep(result)

	_.unset(result, 'query')

	/*Object.entries(filteredResult).forEach(v => {
		v[1].forEach((__: unknown, i: number) => {
			_.unset(filteredResult, `${v[0]}[${i}].vector`)	
		})
	})*/

	callOutput.value = JSON.stringify(result, undefined, 2)

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
<b>Source</b>: %{customdata.source}<br>
<b>When</b>: %{customdata.when}<br>
<b>Score</b>: %{customdata.score}
<extra></extra>
			`,
			marker: { size: 10 },
		}
	})
})

const onPointClick = (data: any) => {
	clickedPoint.value = data.points[0]
	sidePanel.value?.togglePanel()
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
			<SelectBox ref="selectCollection" class="join-item min-w-fit bg-base-200 p-1"
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
		<div v-if="showSpinner" class="flex grow items-center justify-center">
			<span class="loading loading-spinner w-12 text-primary" />
		</div>
		<div v-else-if="currentError" class="flex grow items-center justify-center">
			<p class="w-fit rounded bg-error p-4 font-semibold text-base-100">
				{{ currentError }}
			</p>
		</div>
		<div v-else-if="!showSpinner && currentError === '' && callOutput != '{}'" class="flex flex-col items-center justify-center gap-4">
			<Plotly :data="getPlotData" :layout="{
					title: 'Similar memories',
					font: {
						family: 'Ubuntu',
						size: 12,
						color: isDark ? '#F4F4F5' : '#383938'
					},
					xaxis: { color: isDark ? '#F4F4F5' : '#383938', showticklabels: false },
					yaxis: { color: isDark ? '#F4F4F5' : '#383938', showticklabels: false },
					paper_bgcolor: isDark ? '#383938' : '#F4F4F5',
					plot_bgcolor: isDark ? '#383938' : '#F4F4F5',
					showlegend: true,
					legend: { x: 0, xanchor: 'right', title: { text: 'Collections' } },
					margin: { b: 40, l: 40, t: 40, r: 40 }
				}" :modeBarButtonsToRemove="['zoom2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'resetScale2d']"
				:toImageButtonOptions="{
					format: 'jpeg',
					filename: 'recall_plot',
					scale: 1.5
				}"
				:displayModeBar="true" :displaylogo="false" :responsive="true" :scrollZoom="true" @plotly_click="onPointClick" />
			<button class="btn-info btn" @click="download(callOutput, 'result.json', 'text/plain')">
				Export the result
			</button>
			<JsonTreeView :data="callOutput" rootKey="result" :colorScheme="isDark ? 'dark' : 'light'" />
		</div>
		<SidePanel ref="sidePanel" title="Memory content">
			<div class="overflow-x-auto rounded-md border-2 border-neutral">
				<table class="table-zebra table-sm table">
					<tbody>
						<tr>
							<td>Text</td>
							<td>{{ clickedPoint.text }}</td>
						</tr>
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

