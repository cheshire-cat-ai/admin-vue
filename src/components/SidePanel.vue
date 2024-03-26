<script setup lang="ts">
const props = defineProps<{
	title: string
	loading?: boolean
}>()

const [isOpen, togglePanel] = useToggle(false)

const emit = defineEmits<{
	close: []
}>()

const closePanel = () => {
	isOpen.value = false
	emit('close')
}

defineExpose({
	togglePanel,
	closePanel,
	isOpen,
})

const closeIfNotLoading = () => {
	if (!props.loading) isOpen.value = false
}
</script>

<template>
	<TransitionRoot as="template" :show="isOpen">
		<Dialog as="div" class="relative z-40" @close="closeIfNotLoading()">
			<TransitionChild
				as="template"
				enter="ease-in-out duration-300"
				enter-from="opacity-0"
				enter-to="opacity-100"
				leave="ease-in-out duration-300"
				leave-from="opacity-100"
				leave-to="opacity-0">
				<div class="fixed inset-0 bg-base-100/50 transition-opacity" />
			</TransitionChild>
			<div class="fixed inset-0 overflow-hidden">
				<div class="absolute inset-0 overflow-hidden">
					<div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
						<TransitionChild
							as="template"
							enter="transform transition ease-in-out duration-500"
							enter-from="translate-x-full"
							enter-to="translate-x-0"
							leave="transform transition ease-in-out duration-500"
							leave-from="translate-x-0"
							leave-to="translate-x-full">
							<DialogPanel class="pointer-events-auto relative w-screen md:max-w-xl">
								<div class="flex h-full flex-col bg-base-300 text-neutral">
									<div class="flex items-center justify-between gap-2 p-2 md:p-4">
										<DialogTitle class="text-lg font-semibold">
											{{ title }}
										</DialogTitle>
										<button class="btn btn-circle btn-sm" @click="closeIfNotLoading()">
											<span class="sr-only">Close panel</span>
											<heroicons-x-mark-20-solid class="size-6" />
										</button>
									</div>
									<div class="relative flex flex-1 flex-col overflow-y-auto p-2 md:p-4">
										<slot />
									</div>
								</div>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</div>
		</Dialog>
	</TransitionRoot>
</template>
