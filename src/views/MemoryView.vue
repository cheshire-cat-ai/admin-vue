<script setup lang="ts">
import _ from 'lodash'
import download from 'downloadjs'
import { useMemory } from '@stores/useMemory'
import { useSettings } from '@stores/useSettings'
import SelectBox from '@components/SelectBox.vue'
import { now } from 'lodash'
import ApexChart from "vue3-apexcharts"
import { Matrix, TSNE } from '@saehrimnir/druidjs'
import SidePanel from '@components/SidePanel.vue'
import ModalBox from '@components/ModalBox.vue'
import type { VectorsData } from 'ccat-api'

interface MarkerData {
	id: string,
	collection: string,
	text: string,
	when: string,
	source: string,
	score: number
}

interface PlotData {
	name: string
	data: {
		x: number,
		y: number
	}[]
	meta?: MarkerData[]
}

const { isDark } = storeToRefs(useSettings())

const callText = ref(''), callOutput = ref<VectorsData>(), kMems = ref(10)
const plotOutput = ref<PlotData[]>([]), clickedPoint = ref<MarkerData>()
const pointInfoPanel = ref<InstanceType<typeof SidePanel>>()
const memoryDetailsPanel = ref<InstanceType<typeof SidePanel>>()
const boxWipe = ref<InstanceType<typeof ModalBox>>()
const selectCollection = ref<InstanceType<typeof SelectBox>>()

const [ showSpinner, toggleSpinner ] = useToggle(false)
const { t } = useI18n()

const memoryStore = useMemory()
const { currentState: memoryState } = storeToRefs(memoryStore)
const { wipeAllCollections, wipeCollection, callMemory, deleteMemoryPoint } = memoryStore

/**
 * If "all", wipes all the collections in memory, otherwise only the selected one
 */
const wipeMemory = async () => {
	if (selectCollection.value) {
		const selected = selectCollection.value.selectedElement?.value
		if (!selected) return
		if (selected === 'all') await wipeAllCollections()
		else await wipeCollection(selected)
		boxWipe.value?.toggleModal()
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

	const maxPerplexity = _.reduce(_.values(collectionsLengths), (p, c) => p + c, 0)

	const matrix = reduceTo2d({ 
		perplexity: Math.min(Math.max(kMems.value, 2), maxPerplexity)
	}, 1000, ..._.map(jsonResult, (v) => _.map(v, c => c.vector)), mats)

	return {
		matrix,
		data: _.map(_.entries(jsonResult), (c, i, k) => {
			const prev = k.slice(0, i).reduce((p, v) => p + v[1].length, 0)
			const curr = c[1].length
			return {
				name: _.capitalize(c[0]),
				data: matrix.slice(prev, prev + curr).map(m => ({
					x: m[0],
					y: m[1]
				})),
				meta: c[1].map(v => {
					return {
						id: v.id,
						collection: c[0],
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
		data: memoryPlot.matrix.slice(-1).map(v => ({
			x: v[0],
			y: v[1]
		})),
		meta: [{
			id: 'none',
			collection: 'query',
			text: callText.value,
			source: 'query',
			when: 'now',
			score: 1,
		}]
	})

	callOutput.value = result.vectors

	toggleSpinner()
}

const getSelectCollections = computed(() => {
	const data = memoryState.value.data ?? []
	const totalCollections = data.map(v => v.vectors_count).reduce((p, c) => p + c, 0)
	if (selectCollection.value?.selectedElement?.value === 'all') {
		selectCollection.value.selectedElement.label = `${t('memory.all')} (${totalCollections})`
	}
	return [
		{ label: `${t('memory.all')} (${totalCollections})`, value: 'all' },
		...data.map(v => ({ label: `${_.capitalize(v.name)} (${v.vectors_count})`, value: v.name }))
	]
})

const deleteMemoryMarker = async (collection: string, memory: string) => {
	const pointData = plotOutput.value.find(c => c.name.toLowerCase() == collection)
	const index = pointData?.meta?.findIndex(v => v.id == memory)
	if (index == undefined || pointData == undefined) return
	await deleteMemoryPoint(collection, memory)
	pointInfoPanel.value?.togglePanel()
	_.remove(pointData.meta ?? [], v => v.id == memory)
	_.pull(pointData.data, pointData.data[index])
}

const onMarkerClick = (_e: MouseEvent, _c: object, { seriesIndex, dataPointIndex, w }: any) => {
	clickedPoint.value = w.config.series[seriesIndex].meta[dataPointIndex]
	pointInfoPanel.value?.togglePanel()
}

const downloadResult = () => {
	const output = { export_time: now() }
	_.assign(output, callOutput.value)
	download(JSON.stringify(output, undefined, 2), 'recalledMemories.json', 'application/json')
}
</script>

<template>
	<div class="flex w-full flex-col gap-8 self-center md:w-3/4">
		<div class="flex gap-4">
			<InputBox v-model.trim="callText" placeholder="Enter a text..." :label="$t('memory.label.input')" 
				search :disabled="Boolean(memoryState.error) || memoryState.loading" @send="recallMemory()" />
			<div class="form-control">
				<label class="label">
					<span class="label-text font-medium text-primary">{{ $t('memory.label.k') }}</span>
				</label>
				<input v-model="kMems" :disabled="Boolean(memoryState.error) || memoryState.loading" type="number" min="1" 
					class="input input-primary input-sm w-24 pl-2 pr-0">
			</div>
		</div>
		<div v-if="showSpinner || memoryState.loading" class="flex grow items-center justify-center">
			<span class="loading loading-spinner w-12 text-primary" />
		</div>
		<div v-else-if="memoryState.error" class="flex grow items-center justify-center">
			<p class="w-fit rounded bg-error p-4 font-semibold text-base-100">
				{{ memoryState.error }}
			</p>
		</div>
		<ApexChart v-else-if="!showSpinner && !memoryState.error && callOutput" 
			type="scatter" width="100%" height="500" class="min-w-full max-w-full" 
			:options="{
				chart: {
					offsetY: 8,
					defaultLocale: 'en',
					fontFamily: 'Ubuntu',
					background: 'transparent',
					animations: { 
						speed: 300,
						dynamicAnimation: {
							enabled: false
						}
					},
					toolbar: {
						tools: {
							zoomin: false,
							pan: false,
							customIcons: [
								{
									icon: `<button class=\'btn-info btn btn-xs whitespace-nowrap\'>${$t('memory.plot.export')}</button>`,
									index: 3,
									title: 'Export the recalled memories',
									class: 'custom-icon',
									click: downloadResult
								},
								{
									icon: `<button class=\'btn-warning btn btn-xs whitespace-nowrap\'>${$t('memory.plot.details')}</button>`,
									index: 3,
									title: 'Show the recalled memories details',
									class: 'custom-icon',
									click: () => memoryDetailsPanel?.togglePanel()
								}
							]
						},
						export: {
							csv: { filename: 'recallPlot', },
							svg: { filename: 'recallPlot', },
							png: { filename: 'recallPlot', }
						},
					},
					zoom: {
						type: 'xy',
						autoScaleYaxis: true
					}
				},
				grid: {
					borderColor: isDark ? '#F4F4F5' : '#383938',
					xaxis: { lines: { show: true, }, },   
					yaxis: { lines: { show: true, }, },
				},
				legend: { showForSingleSeries: true, },
				theme: { mode: isDark ? 'dark' : 'light', },
				tooltip: {
					theme: isDark ? 'dark' : 'light',
					intersect: true,
					style: { fontFamily: 'Ubuntu', },
					custom: ({ seriesIndex, dataPointIndex, w }: any) => {
						const text = w.config.series[seriesIndex].meta[dataPointIndex].text
						return `<div class=\'marker-tooltip flex flex-col p-1\'>
							<i>${text.substring(0, 30).concat('...')}</i>
							<b><i>*${$t('memory.plot.more')}*</i></b>
						</div>`
					}
				},
				markers: { strokeWidth: 0, },
				yaxis: {
					type: 'numeric',
					labels: { show: false, },
					tooltip: { enabled: false, }
				},
				xaxis: {
					type: 'numeric',
					labels: { show: false, },
					tooltip: { enabled: false, }
				}
			}"
			:series="plotOutput" @markerClick="onMarkerClick" />
		<div class="divider !my-0" />
		<div class="join w-fit self-center shadow-xl">
			<button :disabled="Boolean(memoryState.error) || memoryState.loading" 
				class="btn btn-error join-item" @click="boxWipe?.toggleModal()">
				{{ $t('memory.wipe') }}
			</button>
			<SelectBox ref="selectCollection" class="join-item min-w-fit bg-base-100 p-1" :list="getSelectCollections" />
		</div>
		<ModalBox ref="boxWipe">
			<div class="flex flex-col items-center justify-center gap-4 text-neutral">
				<h3 class="text-lg font-bold text-primary">
					Wipe collection
				</h3>
				<i18n-t keypath="memory.wipe_modal" tag="p" :plural="Number(selectCollection?.selectedElement.label.startsWith('All'))">
					<template #c>
						<span class="font-bold">
							{{ selectCollection?.selectedElement.label.toLowerCase() }}
						</span> 
					</template>
				</i18n-t>
				<div class="flex items-center justify-center gap-2">
					<button class="btn btn-outline btn-sm" @click="boxWipe?.toggleModal()">
						{{ $t('no') }}
					</button>
					<button class="btn btn-error btn-sm" @click="wipeMemory()">
						{{ $t('yes') }}
					</button>
				</div>
			</div>
		</ModalBox>
		<SidePanel v-if="callOutput" ref="memoryDetailsPanel" title="Memory details">
			<div class="flex w-full flex-col">
				<p class="self-start rounded-t-md bg-primary px-2 py-1 font-medium text-base-100">
					{{ callOutput.embedder }}
				</p>
				<MemorySelect class="rounded-tl-none" :result="callOutput.collections" />
			</div>
		</SidePanel>
		<SidePanel v-if="clickedPoint" ref="pointInfoPanel" title="Memory content">
			<div class="overflow-x-auto rounded-md border-2 border-neutral">
				<table class="table table-zebra table-sm">
					<tbody>
						<tr v-for="data in Object.entries(clickedPoint)" :key="data[0]">
							<td v-t="`memory.metadata.${data[0]}`" />
							<td>{{ data[1] }}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<button v-if="!['procedural', 'query'].includes(clickedPoint.collection)" class="btn btn-error btn-sm mt-auto" 
				@click="deleteMemoryMarker(clickedPoint.collection, clickedPoint.id)">
				{{ $t('memory.delete') }}
			</button>
		</SidePanel>
	</div>
</template>

<style scoped>
.table tr td:first-child {
	@apply font-medium text-primary;
}
</style>

