<script setup lang="ts">
import { useField } from 'vee-validate'

const props = defineProps<{
    name: string,
    indeterminate: boolean
    modelValue?: boolean
    rules?: string
}>();

const { name, indeterminate, rules } = toRefs(props)

const toggleEl = ref<HTMLInputElement>()

onMounted(() => {
    if (toggleEl.value) {
        toggleEl.value.indeterminate = indeterminate.value
    }
})

const { checked, handleChange } = useField(name, rules, {
    type: 'checkbox',
    validateOnValueUpdate: true,
    checkedValue: true,
    uncheckedValue: false
});
</script>

<template>
	<input ref="toggleEl" :checked="checked" type="checkbox" 
		class="!toggle !toggle-success" @input="handleChange" />
</template>