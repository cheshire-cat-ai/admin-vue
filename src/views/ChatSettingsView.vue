<script setup lang="ts">
import _ from 'lodash'
import { useNotifications } from '@stores/useNotifications'
import { useMessages } from '@stores/useMessages'

const { promptSettings } = storeToRefs(useMessages())
const { showNotification } = useNotifications()

const tempSettings = ref(_.cloneDeep(promptSettings.value))

const emit = defineEmits<{
	(e: 'close'): void
}>()

const saveChatSettings = () => {
    promptSettings.value = tempSettings.value
    showNotification({
        type: 'success',
        text: "Chat settings saved successfully"
    })
    emit('close')
}
</script>

<template>
	<div class="flex grow flex-col gap-4">
		<div class="flex flex-col items-end gap-4">
			<div class="form-control mb-4 w-full">
				<p class="mb-1 text-sm font-medium text-primary">
					{{ $t('chat.settings.title') }}
				</p>
				<textarea v-model="tempSettings.prefix" placeholder="Enter the prompt prefix..."
					class="textarea block w-full resize-y overflow-auto !outline-offset-0" />
			</div>
			<template v-for="(v, k) in tempSettings" :key="k">
				<div v-if="typeof v === 'boolean'" class="flex gap-2">
					<p>{{ _.join(_.map(_.split(k.toString(), "_"), (s) => _.capitalize(s)), " ") }}</p>
					<input v-model="tempSettings[k]" type="checkbox" class="!toggle !toggle-success">
				</div>
			</template>
		</div>
		<button class="btn btn-success btn-sm mt-auto normal-case" @click="saveChatSettings">
			{{ $t('save') }}
		</button>
	</div>
</template>
