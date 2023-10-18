<script setup lang="ts">
import type { JSONSettings, SchemaField } from '@models/JSONSchema'
import { merge } from 'lodash'
import { Form, Field } from 'vee-validate'

// FEATURE: Improve form to allow any type of input based on json schema
// Can also totally replace the current library used for dynamic form

const props = withDefaults(
	defineProps<{
		fields: SchemaField[]
		initial?: JSONSettings
		disabled?: boolean
	}>(),
	{
		initial: () => ({}),
		disabled: false,
	},
)

const dynamicForm = ref<InstanceType<typeof Form>>()
const initValues = ref<JSONSettings>()

watchImmediate(props, () => {
	initValues.value = props.fields.reduce((p, c) => {
		return {
			...p,
			[c.name]: c.default,
		}
	}, {})
	initValues.value = merge(initValues.value, props.initial)
	dynamicForm.value?.resetForm()
})

defineEmits<{
	(e: 'submit', payload: JSONSettings): void
}>()
</script>

<template>
	<Form
		v-slot="{ errors }"
		ref="dynamicForm"
		class="flex h-full flex-col gap-4"
		:initialValues="initValues"
		:validateOnMount="true"
		:keepValues="false"
		@submit="$emit('submit', $event)">
		<div class="form-control w-full">
			<div
				v-for="{ name, label, children, description, ...attrs } in fields"
				:key="name"
				class="form-control w-full"
				:class="{
					'flex-row-reverse items-center justify-end': attrs.type === 'checkbox',
				}">
				<label v-if="label" class="label justify-start gap-1 text-neutral" :for="name">
					<span v-if="attrs.default === undefined" class="font-bold text-error">*</span>
					<span class="label-text font-medium">{{ label }}</span>
					<div class="tooltip tooltip-right" :data-tip="description">
						<ph-info class="h-4 w-4" />
					</div>
				</label>
				<CheckBox
					v-if="attrs.type === 'checkbox'"
					:indeterminate="attrs.default == undefined"
					:name="name"
					:rules="attrs.rules" />
				<Field
					v-else
					:id="name"
					:name="name"
					:placeholder="label"
					v-bind="attrs"
					:disabled="disabled"
					:class="{
						'textarea block w-full overflow-auto bg-base-200 !outline-offset-0': attrs.as === 'textarea',
						'select select-bordered select-sm mb-2 w-full !leading-4': attrs.as === 'select',
						'input input-primary input-sm mb-2 w-full !transition-all': attrs.as === 'input',
					}">
					<template v-if="children && children.length">
						<component :is="'option'" v-for="({ text, ...childAttrs }, idx) in children" :key="idx" v-bind="childAttrs">
							{{ text }}
						</component>
					</template>
				</Field>
			</div>
		</div>
		<div class="mt-auto flex gap-2">
			<button type="reset" class="btn btn-error btn-sm grow normal-case">Reset</button>
			<button
				type="submit"
				class="btn btn-success btn-sm grow normal-case"
				:disabled="disabled || Object.keys(errors).length > 0">
				Save
			</button>
		</div>
	</Form>
</template>
