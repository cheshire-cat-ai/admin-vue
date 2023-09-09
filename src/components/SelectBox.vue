<script setup lang="ts">
// TODO: Use generics when https://github.com/vuejs/core/issues/8373 is fixed
interface SelectItem {
	label: string
	value: any
}

const props = withDefaults(
	defineProps<{
		list: SelectItem[]
		modelValue?: SelectItem['value']
		color?: string
		padding?: string
		disabled?: boolean
	}>(),
	{
		modelValue: (p: { list: SelectItem[] }) => p.list[0].value, // TODO: Fix this (why it doesn't infer the type of props?)
		color: 'bg-base-100',
		padding: 'p-2',
		disabled: false,
	},
)

const { list, modelValue } = toRefs(props)

const selected = ref(list.value[0])

watchImmediate(list, () => {
	selected.value = list.value.find(v => v.value == modelValue.value) ?? list.value[0]
})

const emit = defineEmits<{
	(e: 'update:modelValue', payload: unknown): void
	(e: 'update', payload: SelectItem): void
}>()

const updateSelect = (value: SelectItem) => {
	emit('update:modelValue', value.value)
	emit('update', value)
}

defineExpose({
	selected,
})
</script>

<template>
	<Listbox v-model="selected" by="value" :disabled="disabled" @update:modelValue="updateSelect">
		<div class="relative rounded-lg">
			<ListboxButton
				:class="[color, padding]"
				class="flex w-full cursor-default items-center justify-between gap-1 rounded-md text-left text-sm">
				<span class="block truncate font-semibold">{{ selected.label }}</span>
				<heroicons-chevron-up-down-20-solid class="h-6 w-6" />
			</ListboxButton>
			<Transition
				enterActiveClass="transition duration-200 ease-out"
				enterFromClass="transform opacity-0"
				enterToClass="transform opacity-100"
				leaveActiveClass="transition duration-200 ease-in"
				leaveFromClass="transform opacity-100"
				leaveToClass="transform opacity-0">
				<ListboxOptions
					:class="[color]"
					class="join join-vertical absolute z-10 mt-4 w-full min-w-fit overflow-auto rounded-md text-sm shadow-lg">
					<ListboxOption
						v-for="element in list"
						:key="element.label"
						v-slot="{ active: activeEl, selected: selectedEl }"
						as="template"
						:value="element">
						<li
							:class="[
								activeEl ? 'bg-primary !text-base-100' : '',
								selectedEl ? 'bg-primary-focus font-semibold text-base-100' : 'text-neutral',
								'join-item relative cursor-default select-none px-3 py-2',
							]">
							<span class="block truncate">{{ element.label }}</span>
						</li>
					</ListboxOption>
				</ListboxOptions>
			</Transition>
		</div>
	</Listbox>
</template>
