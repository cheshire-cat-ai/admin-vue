<script setup lang="ts" generic="T">
const props = withDefaults(defineProps<{
	list: T[]
    pageSize?: number
    initialPage?: number
}>(), {
	pageSize: 10,
	initialPage: 1
})

const { list, pageSize, initialPage } = toRefs(props)

const currentList = ref([]) as Ref<T[]>
const totList = ref(0)

watchImmediate(props, () => {
	currentList.value = list.value.slice(0, pageSize.value)
	totList.value = list.value.length
})

const { 
	currentPage,
	isFirstPage,
	isLastPage,
	pageCount,
	prev, next
} = useOffsetPagination({ total: totList, page: initialPage.value, pageSize: pageSize.value,
	onPageChange: ({ currentPage: page, currentPageSize: size }) => {
		const start = (page - 1) * size
		const end = start + size
		currentList.value = list.value.slice(start, end)
	}
})

defineExpose({
    currentPage,
    isFirstPage,
    isLastPage,
    pageCount
})
</script>

<template>
	<div class="flex flex-col gap-4">
		<slot :list="currentList" />
		<div class="join self-center">
			<button class="btn btn-square btn-neutral join-item btn-sm" :disabled="isFirstPage" @click="prev">
				<ph-caret-left-fill class="h-5 w-5" />
			</button>
			<button class="btn btn-square btn-neutral join-item btn-sm" 
				:class="{ '!btn-primary': currentPage == 1 }" @click="currentPage = 1">
				1
			</button>
			<template v-if="pageCount >= 2">
				<button v-if="currentPage - 1 != 1 && !isLastPage" 
					class="btn btn-square btn-neutral join-item btn-sm" disabled>
					...
				</button>
				<button v-if="!isLastPage && !isFirstPage" class="btn btn-square btn-primary join-item btn-sm">
					{{ currentPage }}
				</button>
				<button v-if="currentPage + 1 != pageCount && !isFirstPage" 
					class="btn btn-square btn-neutral join-item btn-sm" disabled>
					...
				</button>
				<button class="btn btn-square btn-neutral join-item btn-sm" 
					:class="{ '!btn-primary': pageCount == currentPage }" @click="currentPage = pageCount">
					{{ pageCount }}
				</button>
			</template>
			<button class="btn btn-square btn-neutral join-item btn-sm" :disabled="isLastPage" @click="next">
				<ph-caret-right-fill class="h-5 w-5" />
			</button>
		</div>
	</div>
</template>