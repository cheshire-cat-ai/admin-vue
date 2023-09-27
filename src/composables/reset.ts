import LogService from '@services/LogService'
import type { Pinia, Store } from 'pinia'

interface ExtendedPinia extends Pinia {
	_s: Map<string, Store>
}

/**
 * A composable method to reset all the Pinia stores at once
 */
export function resetAllStores() {
	const pinia = getActivePinia() as ExtendedPinia

	if (!pinia) return

	pinia._s.forEach(store => {
		store.$dispose()
		store.$reset()
	})

	LogService.success('All stores were reset successfully!')
}
