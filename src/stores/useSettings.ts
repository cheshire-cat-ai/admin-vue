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

  return {
    isAudioEnabled,
    isDark,
    currentFilters,
    toggleDark
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot))
}
