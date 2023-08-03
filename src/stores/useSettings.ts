import type { AuthForm } from "@/api"

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
  const authSettings = useLocalStorage<AuthForm>('authSettings', {
    baseUrl: 'localhost',
    authKey: '',
    port: 1865,
    secure: false
  })
  const isAuth = ref(false)

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
    authSettings,
    currentFilters,
    toggleDark,
    mustSummarize
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot))
}
