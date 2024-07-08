import { useAbility } from '@casl/vue'
import type { AppAbility } from '@/api'

export const usePerms = () => useAbility<AppAbility>()
