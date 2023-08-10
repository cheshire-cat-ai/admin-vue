import { apiClient, tryRequest } from "@/api"

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

  const getStatus = async () => {
    const result = await tryRequest(
      apiClient.api?.status.home(), 
      "Getting Cheshire Cat status", 
      "Unable to fetch Cheshire Cat status"
    )
    return result.data
  }
  
  const { state: cat } = useAsyncState(getStatus(), undefined)

  return {
    isAudioEnabled,
    isDark,
    currentFilters,
    toggleDark,
    cat,
    mustSummarize
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot))
}
