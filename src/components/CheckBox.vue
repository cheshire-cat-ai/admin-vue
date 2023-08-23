<script setup lang="ts">
import { useField } from 'vee-validate'

const props = defineProps<{
    modelValue?: boolean
    name: string
}>();

const { name, modelValue } = toRefs(props)

const toggleEl = ref<HTMLInputElement>()

onMounted(() => {
    if (toggleEl.value) {
        toggleEl.value.indeterminate = modelValue.value == undefined
    }
})

const { checked } = useField(name, undefined, {
    type: 'checkbox',
    checkedValue: true,
    uncheckedValue: false
});
</script>

<template>
	<input ref="toggleEl" v-model="checked" type="checkbox" class="!toggle !toggle-success" />
</template>