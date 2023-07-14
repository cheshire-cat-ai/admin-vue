<script setup lang="ts">
import { Locales, type LocaleCode } from '@/i18n'
import SelectBox from '@components/SelectBox.vue'
import { useSettings } from '@stores/useSettings'

const { setLocale } = useSettings()
const selectLocale = ref<InstanceType<typeof SelectBox>>()

const { availableLocales, locale } = useI18n()

const changeLocale = () => {
	const selectedLocale = selectLocale.value?.selectedElement?.value as LocaleCode
	if (!selectedLocale) return
	locale.value = setLocale(selectedLocale)
}

const getAvailableLocales = computed(() => {
	return availableLocales.map(v => {
		return {
			label: Locales[v as LocaleCode].name,
			value: v
		}
	})
})
</script>

<template>
	<div class="join w-fit self-center shadow-xl">
		<button class="btn-primary join-item btn" @click="changeLocale">
			Change
		</button>
		<SelectBox ref="selectLocale" class="join-item min-w-fit bg-base-100 p-1" 
			:picked="locale" :list="getAvailableLocales" />
	</div>
</template>
