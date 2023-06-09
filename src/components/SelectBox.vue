<script setup lang="ts">
const props = withDefaults(defineProps<{
    list: {
        label: string,
        value: string
    }[],
    picked?: string
}>(), {
	picked: (p) => p.list[0].value
})

const selectedElement = ref(props.list.find(v => v.value === props.picked))

const emit = defineEmits<{
	(e: 'update', value: typeof props.list[number]): void
}>()

defineExpose({
    selectedElement
})
</script>

<template>
	<Listbox v-model="selectedElement" @update:modelValue="value => emit('update', value)">
		<div class="relative">
			<ListboxButton
				class="flex w-full cursor-default justify-between gap-1 rounded-md bg-base-200 p-3 text-left text-sm shadow-md focus:outline-none">
				<span class="block truncate font-semibold">{{ selectedElement?.label }}</span>
				<heroicons-chevron-up-down-20-solid class="h-6 w-6" />
			</ListboxButton>
			<Transition enterActiveClass="transition duration-200 ease-out"
				enterFromClass="transform opacity-0" enterToClass="transform opacity-100"
				leaveActiveClass="transition duration-200 ease-in" leaveFromClass="transform opacity-100"
				leaveToClass="transform opacity-0">
				<ListboxOptions class="absolute z-10 mt-2 w-full min-w-fit overflow-auto rounded-md bg-base-200 text-sm shadow-lg">
					<ListboxOption v-for="element in list" :key="element.value" v-slot="{ active, selected }" as="template" :value="element">
						<li :class="[
							active ? 'bg-base-300' : '',
							selected ? 'bg-primary font-semibold text-base-100' : 'text-neutral',
							'relative cursor-default select-none px-3 py-2',
						]">
							<span class="block truncate">{{ element.label }}</span>
						</li>
					</ListboxOption>
				</ListboxOptions>
			</Transition>
		</div>
	</Listbox>
</template>
