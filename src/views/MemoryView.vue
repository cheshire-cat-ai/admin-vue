<script setup lang="ts">
import { map, omitBy, reduce, values, isEmpty, capitalize, entries, assign, remove, pull } from 'lodash'
import { useMemory } from '@stores/useMemory'
import { useSettings } from '@stores/useSettings'
import SelectBox from '@components/SelectBox.vue'
import { now } from 'lodash'
import ApexChart from 'vue3-apexcharts'
import { Matrix, TSNE } from '@saehrimnir/druidjs'
import SidePanel from '@components/SidePanel.vue'
import ModalBox from '@components/ModalBox.vue'
import type { VectorsData } from 'ccat-api'
import type { MarkerData, PlotData } from '@models/Plot'

const { isDark } = storeToRefs(useSettings())

const callText = ref(''),
	callOutput = ref<VectorsData>(),
	kMems = ref(10)
const plotOutput = ref<PlotData[]>([]),
	clickedPoint = ref<MarkerData>()
const pointInfoPanel = ref<InstanceType<typeof SidePanel>>()
const memoryDetailsPanel = ref<InstanceType<typeof SidePanel>>()
const boxWipe = ref<InstanceType<typeof ModalBox>>()
const selectCollection = ref<InstanceType<typeof SelectBox>>()

const [showSpinner, toggleSpinner] = useToggle(false)

const memoryStore = useMemory()
const { currentState: memoryState } = storeToRefs(memoryStore)
const { wipeAllCollections, wipeCollection, callMemory, deleteMemoryPoint } = memoryStore

const { download: downloadMemories } = downloadContent('Recalled_Memories')
const { upload: uploadFile } = uploadContent()

/**
 * If "all", wipes all the collections in memory, otherwise only the selected one
 */
const wipeMemory = async () => {
	if (selectCollection.value) {
		const selected = selectCollection.value.selected?.value
		if (!selected) return
		if (boxWipe.value?.isOpen) boxWipe.value?.closeModal()
		if (selected === 'all') await wipeAllCollections()
		else await wipeCollection(selected)
		if (boxWipe.value?.isOpen) boxWipe.value?.toggleModal()
	}
}

/**
 * Merges and reduces the matrices to a new matrix that can be plotted in a 2d graph
 * @param perplexity the perplexity to pass in the t-SNE algorithm
 * @param iterations the number of interations to make to increase the precision of the algorithm
 * @param mats the matrices to pass to the algorithm
 */
const reduceTo2d = (options: ConstructorParameters<typeof TSNE>['1'], iterations: number, ...mats: number[][][]) => {
	const matrix = map(omitBy(mats, isEmpty), v => Matrix.from(v))
	const tsne = new TSNE(
		matrix.reduce((p, c) => p.concat(c, 'vertical')),
		options,
	).transform(iterations)
	return tsne instanceof Matrix ? tsne.to2dArray : tsne
}

/**
 * Creates the plot data that can be shown in the graph
 * @param jsonResult the Memory object to use for the plot
 * @param mats additional matrices to concatenate in the reduction
 */
const showMemoryPlot = (jsonResult: VectorsData['collections'], ...mats: number[][]) => {
	const collectionsLengths = reduce(jsonResult, (a, v, k) => ({ ...a, [k]: v.length }), {}) as Record<string, number>

	const maxPoints = reduce(values(collectionsLengths), (p, c) => p + c, 0)

	const matrix = reduceTo2d(
		{
			perplexity: Math.min(Math.max(kMems.value, 2), maxPoints),
		},
		1000,
		...map(jsonResult, v => map(v, c => c.vector)),
		mats,
	)

	return {
		matrix,
		data: map(entries(jsonResult), (c, i, k) => {
			const prev = k.slice(0, i).reduce((p, v) => p + v[1].length, 0)
			const curr = c[1].length
			return {
				name: capitalize(c[0]),
				data: matrix.slice(prev, prev + curr).map((m: any) => ({
					x: m[0],
					y: m[1],
				})),
				meta: c[1].map(v => {
					return {
						id: v.id,
						collection: c[0],
						text: v.page_content,
						source: v.metadata.source,
						when: new Date(v.metadata.when * 1000).toLocaleString(),
						score: v.score,
					}
				}),
			}
		}) as PlotData[],
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
		data: memoryPlot.matrix.slice(-1).map((v: any) => ({
			x: v[0],
			y: v[1],
		})),
		meta: [
			{
				id: 'none',
				collection: 'query',
				text: callText.value,
				source: 'query',
				when: 'now',
				score: 1,
			},
		],
	})

	callOutput.value = result.vectors

	toggleSpinner()
}

const selectBoxCollections = computed(() => {
	const data = (memoryState.value.data ?? []).filter(v => v.name != 'procedural')
	const totalCollections = data.map(v => v.vectors_count).reduce((p, c) => p + c, 0)
	return [
		{ label: `All (${totalCollections})`, value: 'all' },
		...data.map(v => ({ label: `${capitalize(v.name)} (${v.vectors_count})`, value: v.name })),
	]
})

const deleteMemoryMarker = async (collection: string, memory: string) => {
	const pointData = plotOutput.value.find(c => c.name.toLowerCase() == collection)
	const index = pointData?.meta?.findIndex(v => v.id == memory)
	if (index == undefined || pointData == undefined) return
	await deleteMemoryPoint(collection, memory)
	pointInfoPanel.value?.togglePanel()
	remove(pointData.meta ?? [], v => v.id == memory)
	pull(pointData.data, pointData.data[index])
}

const onMarkerClick = (_e: MouseEvent, _c: object, { seriesIndex, dataPointIndex, w }: any) => {
	clickedPoint.value = w.config.series[seriesIndex].meta[dataPointIndex]
	pointInfoPanel.value?.togglePanel()
}

/*const dateFilter = ref(''), sourceFilter = ref('')*/
</script>

<template>
	<div class="memory-page flex w-full flex-col gap-8 self-center md:w-3/4">
		<div class="flex flex-col gap-4">
			<div class="flex gap-4">
				<InputBox
					v-model.trim="callText"
					placeholder="Enter a text..."
					label="Search similar memories"
					search
					:disabled="Boolean(memoryState.error) || memoryState.loading"
					@send="recallMemory()" />
				<div class="form-control">
					<label class="label px-0">
						<span class="label-text font-semibold">K memories</span>
					</label>
					<input
						v-model="kMems"
						:disabled="Boolean(memoryState.error) || memoryState.loading"
						type="number"
						min="1"
						class="input input-sm input-primary w-24 shadow-lg !outline-2" />
				</div>
			</div>
			<!--<div class="flex flex-wrap justify-center gap-2">
				<heroicons-adjustments-vertical class="h-6 w-6" />
				<input v-model="dateFilter" type="date" class="input input-primary input-xs w-32" />
				<input v-model="sourceFilter" type="text" placeholder="Source" class="input input-primary input-xs w-32" />
			</div>-->
		</div>
		<Teleport to="#modal">
			<ModalBox ref="boxWipe">
				<div class="flex flex-col items-center justify-center gap-4 text-neutral">
					<h3 class="text-lg font-bold text-primary">Wipe collection</h3>
					<p v-if="selectCollection?.selected.label.startsWith('All')">
						Are you sure you want to wipe
						<span class="font-bold">
							{{ selectCollection?.selected.label.toLowerCase() }}
						</span>
						the collections?
					</p>
					<p v-else>
						Are you sure you want to wipe the
						<span class="font-bold">
							{{ selectCollection?.selected.label.toLowerCase() }}
						</span>
						collection?
					</p>
					<div class="flex items-center justify-center gap-2">
						<button class="btn btn-outline btn-sm" @click="boxWipe?.toggleModal()">No</button>
						<button class="btn btn-error btn-sm" @click="wipeMemory()">Yes</button>
					</div>
				</div>
			</ModalBox>
		</Teleport>
		<ErrorBox
			v-if="showSpinner || memoryState.loading || memoryState.error"
			:load="showSpinner || memoryState.loading"
			:error="memoryState.error"
			:text="`Doing some magic...`" />
		<ApexChart
			v-else-if="plotOutput && callOutput"
			v-memo="[callOutput, plotOutput]"
			type="scatter"
			width="100%"
			height="500"
			class="min-w-full max-w-full"
			:options="{
				chart: {
					offsetY: 8,
					defaultLocale: 'en',
					fontFamily: 'Rubik',
					background: 'transparent',
					animations: {
						speed: 300,
					},
					toolbar: {
						tools: {
							zoomin: false,
							pan: false,
							customIcons: [
								{
									icon: '<button class=\'btn-primary btn btn-xs rounded whitespace-nowrap\'>Import memories</button>',
									index: 3,
									title: 'Import some memories',
									class: 'custom-icon',
									click: () => uploadFile('memory'),
								},
								{
									icon: '<button class=\'btn-primary btn btn-xs rounded whitespace-nowrap\'>Export memories</button>',
									index: 3,
									title: 'Export the recalled memories',
									class: 'custom-icon',
									click: () => downloadMemories(assign({ export_time: now() }, callOutput)),
								},
								{
									icon: '<button class=\'btn-primary btn btn-xs rounded whitespace-nowrap\'>Details</button>',
									index: 3,
									title: 'Show the recalled memories details',
									class: 'custom-icon',
									click: () => memoryDetailsPanel?.togglePanel(),
								},
							],
						},
						export: {
							csv: { filename: 'recallPlot' },
							svg: { filename: 'recallPlot' },
							png: { filename: 'recallPlot' },
						},
					},
					zoom: {
						type: 'xy',
						autoScaleYaxis: true,
						zoomedArea: {
							fill: {
								color: isDark ? '#F4F4F5' : '#383938',
								opacity: 0.4,
							},
							stroke: {
								color: isDark ? '#F4F4F5' : '#383938',
								opacity: 0.4,
								width: 1,
							},
						},
					},
				},
				noData: {
					text: 'No points available',
					align: 'center',
					verticalAlign: 'middle',
					offsetX: 0,
					offsetY: 0,
					style: {
						color: isDark ? '#F4F4F5' : '#383938',
						fontSize: '2rem',
						fontFamily: 'Rubik',
					},
				},
				grid: {
					borderColor: isDark ? '#F4F4F5' : '#383938',
					xaxis: { lines: { show: true } },
					yaxis: { lines: { show: true } },
				},
				legend: { showForSingleSeries: true },
				theme: { mode: isDark ? 'dark' : 'light' },
				tooltip: {
					theme: isDark ? 'dark' : 'light',
					intersect: true,
					style: { fontFamily: 'Rubik' },
					custom: ({ seriesIndex, dataPointIndex, w }: any) => {
						const text = w.config.series[seriesIndex].meta[dataPointIndex].text
						const source = w.config.series[seriesIndex].meta[dataPointIndex].source
						const truncedText = text.length > 200 ? text.substring(0, 200).concat('...') : text

						return `<div class=\'marker-tooltip flex flex-col p-1 max-w-xs whitespace-normal\'>
							<b>Source: ${source}</b>
							<i>${truncedText}</i>
						</div>`
					},
				},
				markers: { strokeWidth: 0 },
				yaxis: {
					type: 'numeric',
					labels: { show: false },
					tooltip: { enabled: false },
				},
				xaxis: {
					type: 'numeric',
					labels: { show: false },
					tooltip: { enabled: false },
				},
			}"
			:series="plotOutput"
			@markerClick="onMarkerClick" />
		<div class="divider !my-0" />
		<div class="join w-fit self-center shadow-xl">
			<button
				:disabled="Boolean(memoryState.error) || memoryState.loading"
				class="btn btn-primary join-item hover:border-error hover:bg-error"
				@click="boxWipe?.toggleModal()">
				<heroicons-trash-solid class="size-4" />
				Wipe
			</button>
			<SelectBox
				ref="selectCollection"
				color="bg-base-100 bottom-16"
				class="join-item min-w-fit bg-base-100 p-1"
				:list="selectBoxCollections" />
		</div>
		<SidePanel ref="memoryDetailsPanel" title="Memory details">
			<div v-if="callOutput" class="flex w-full flex-col">
				<p class="z-10 self-start rounded-t-md bg-base-100 px-2 py-1 font-medium text-neutral">
					{{ callOutput.embedder }}
				</p>
				<MemorySelect class="rounded-tl-none" :result="callOutput.collections" />
			</div>
		</SidePanel>
		<SidePanel ref="pointInfoPanel" title="Memory content">
			<div v-if="clickedPoint" class="overflow-x-auto rounded shadow">
				<div class="divide-y-2 divide-dashed bg-base-100 px-6 py-2">
					<div v-for="(data, key) of clickedPoint" :key="key" className="grid grid-cols-4 grid-rows-1 gap-2 text-sm">
						<div class="py-2 font-medium">{{ capitalize(key) }}</div>
						<div v-if="key === 'collection' && typeof data == 'string'" class="col-span-3 inline-flex items-center gap-2 py-2">
							<ph-chats v-if="data === 'episodic'" class="size-5" />
							<ph-files v-if="data === 'declarative'" class="size-5" />
							<ph-toolbox v-if="data === 'procedural'" class="size-5" />
							<ph-list-magnifying-glass v-if="data === 'query'" class="size-5" />
							{{ capitalize(data) }}
						</div>
						<!-- START THE BUTTON FOR DELETING THE SOURCE - THIS IS JUST EXPERIMENTAL: TO FINALIZE  -->
						<!-- <div v-else-if="!['procedural', 'query'].includes(clickedPoint.collection) && key === 'source'" class="col-span-3 py-2 inline-flex items-center justify-between gap-2">
							{{ data }}
							<button class="link link-error no-underline inline-flex items-center px-2 gap-1 hover:btn-error hover:rounded">
								<heroicons-trash-solid class="w-3 h-3"/>
								Delete source
							</button>
						</div> -->
						<div v-else class="col-span-3 py-2">{{ data }}</div>
					</div>
				</div>
			</div>
			<button
				v-if="clickedPoint && !['procedural', 'query'].includes(clickedPoint.collection)"
				class="btn btn-primary btn-sm mt-auto hover:btn-error"
				@click="deleteMemoryMarker(clickedPoint.collection, clickedPoint.id)">
				<heroicons-trash-solid class="size-4" />
				Delete memory point
			</button>
		</SidePanel>
	</div>
</template>

<style scoped>
.table tr td:first-child {
	@apply font-medium text-primary;
}
</style>
