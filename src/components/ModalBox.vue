<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		shown?: boolean
		closable?: boolean
	}>(),
	{
		shown: false,
		closable: true,
	},
)

const { shown, closable } = toRefs(props)

const [isOpen, toggleModal] = useToggle(shown.value)

watchEffect(() => {
	isOpen.value = shown.value
})

const closeModal = () => {
	if (closable.value) toggleModal()
}

defineExpose({
	toggleModal,
	isOpen,
	closeModal,
})
</script>

<template>
	<TransitionRoot appear :show="isOpen" as="template">
		<Dialog as="div" class="relative z-50" @close="closeModal">
			<TransitionChild
				as="template"
				enter="duration-300 ease-out"
				enter-from="opacity-0"
				enter-to="opacity-100"
				leave="duration-200 ease-in"
				leave-from="opacity-100"
				leave-to="opacity-0">
				<div class="fixed inset-0 bg-black/25" />
			</TransitionChild>
			<div class="fixed inset-0 overflow-y-auto">
				<div class="flex min-h-full items-center justify-center p-4 text-center">
					<TransitionChild
						as="template"
						enter="duration-300 ease-out"
						enter-from="opacity-0 scale-95"
						enter-to="opacity-100 scale-100"
						leave="duration-200 ease-in"
						leave-from="opacity-100 scale-100"
						leave-to="opacity-0 scale-95">
						<DialogPanel class="w-fit max-w-lg overflow-hidden rounded-lg bg-base-100 p-4 shadow-xl transition-all">
							<slot />
						</DialogPanel>
					</TransitionChild>
				</div>
			</div>
		</Dialog>
	</TransitionRoot>
</template>
