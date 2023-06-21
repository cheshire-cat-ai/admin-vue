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

  const toggleDark = useToggle(isDark)

  const currentFilters = useLocalStorage('currentFilters', {
    installed: true,
    registry: true,
    enabled: true,
    disabled: true
  })

  const currentLocale = useLocalStorage('currentLocale', '')

  const setDocumentLanguage = (localeCode: LocaleCode) => {
    const htmlElement = document.documentElement
    htmlElement.setAttribute("lang", localeCode)
  
    if (Locales[localeCode].dir !== "ltr") {
      htmlElement.setAttribute("dir", Locales[localeCode].dir)
    } else {
      htmlElement.removeAttribute("dir")
    }
  }

  const setLocale = (localeCode: LocaleCode, fallbackLocale?: LocaleCode) => {
    return currentLocale.value = localeCode || fallbackLocale || LocaleCode.EN_US
  }

  return {
    isAudioEnabled,
    isDark,
    currentFilters,
    currentLocale,
    toggleDark,
    setDocumentLanguage,
    setLocale
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot))
}
