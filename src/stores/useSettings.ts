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
  const isAuth = useLocalStorage('isAuth', false)

  const toggleDark = useToggle(isDark)

  const currentFilters = useLocalStorage('currentFilters', {
    installed: true,
    registry: true,
    enabled: true,
    disabled: true
  })

  return {
    isAudioEnabled,
    isDark,
    isAuth,
    currentFilters,
    toggleDark,
    mustSummarize
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot))
}
