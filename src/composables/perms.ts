import { useAbility } from '@casl/vue'
import type { AppAbility } from '@services/ApiService'

export const usePerms = () => useAbility<AppAbility>()
