import type { Directive } from 'vue'

export const vLock: Directive<HTMLElement, boolean> = {
	mounted(el, binding) {
		if (binding.value) {
			el.style.pointerEvents = 'none'
		} else {
			el.style.pointerEvents = 'initial'
		}
	},
	updated(el, binding) {
		if (binding.value) {
			el.style.pointerEvents = 'none'
		} else {
			el.style.pointerEvents = 'initial'
		}
	},
}
export default vLock
