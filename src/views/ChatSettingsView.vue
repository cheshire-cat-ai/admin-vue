<script setup lang="ts">
import _ from 'lodash'
import { useNotifications } from '@stores/useNotifications'
import { useMessages } from '@stores/useMessages'
import { uniqueId } from '@utils/commons'

const { promptSettings } = storeToRefs(useMessages())
const { showNotification } = useNotifications()
const tempSettings = ref(_.cloneDeep(promptSettings.value))

const emit = defineEmits<{
	(e: 'close'): void
}>()

const saveChatSettings = () => {
    promptSettings.value = tempSettings.value
    showNotification({
        id: uniqueId(),
        type: 'success',
        text: "Chat settings saved successfully"
    })
    emit('close')
}
</script>

<template>
	<div class="flex flex-col items-center justify-center gap-4 text-neutral">
		<h3 class="text-lg font-bold">
			Chat Settings
		</h3>
		<div class="flex flex-col gap-2">
			<template v-for="(v, k) in tempSettings" :key="k">
				<div v-if="typeof v === 'boolean'" class="flex gap-2">
					<input v-model="tempSettings[k]" type="checkbox" class="!toggle-success !toggle">
					<p>{{ _.join(_.map(_.split(k.toString(), "_"), (s) => _.capitalize(s)), " ") }}</p>
				</div>
			</template>
		</div>
		<button class="btn-primary btn-sm btn" @click="saveChatSettings">
			Save
		</button>
	</div>
</template>
