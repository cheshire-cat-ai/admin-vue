<script setup lang="ts">
interface SelectItem {
	label: string
	value: string
}

const props = withDefaults(
	defineProps<{
		list: SelectItem[]
		color?: string
		padding?: string
		disabled?: boolean
	}>(),
	{
		color: 'bg-base-100',
		padding: 'p-2',
		disabled: false,
	},
)

const model = defineModel<string>()

const { list } = toRefs(props)

const selected = ref(list.value[0])

watchImmediate(list, () => {
	selected.value = list.value.find(v => v.value == model.value) ?? list.value[0]
})

const emit = defineEmits<{
	update: [payload: SelectItem]
}>()

const updateSelect = (value: SelectItem) => {
	emit('update', value)
	selected.value = value
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
				<heroicons-chevron-up-down-20-solid class="size-6" />
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
								selectedEl ? 'bg-primary font-semibold text-base-100' : 'text-neutral',
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
