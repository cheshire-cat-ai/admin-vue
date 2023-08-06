import { Locales, LocaleCode } from "@/i18n"

export const useSettings = defineStore('settings', () => {
  const isAudioEnabled = useLocalStorage('isAudioEnabled', true)
  const isDark = useDark({
    storageKey: 'currentTheme',
    selector: 'html',
    disableTransition: false,
    attribute: 'data-theme',
    valueDark: 'dark',
    valueLight: 'light'
  })
  const mustSummarize = useLocalStorage('mustSummarize', false)

  const toggleDark = useToggle(isDark)

  const currentFilters = useLocalStorage('currentFilters', {
    installed: true,
    registry: true,
    enabled: true,
    disabled: true
  })

  const currentLocale = useLocalStorage<LocaleCode>('currentLocale', LocaleCode.EN_US)

  const setLocale = (localeCode = currentLocale.value, fallbackLocale?: LocaleCode) => {
    currentLocale.value = localeCode || fallbackLocale || LocaleCode.EN_US
    const htmlElement = document.documentElement
    htmlElement.setAttribute("lang", localeCode)
  
    if (Locales[localeCode].dir !== "ltr") {
      htmlElement.setAttribute("dir", Locales[localeCode].dir)
    } else {
      htmlElement.removeAttribute("dir")
    }
    return currentLocale.value
  }

  return {
    isAudioEnabled,
    isDark,
    currentFilters,
    currentLocale,
    toggleDark,
    mustSummarize,
    setLocale,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot))
}
