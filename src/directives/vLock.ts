import type { Directive } from 'vue'

export const vLock: Directive<HTMLElement, boolean> = {
	mounted(el, binding) {
		if (binding.value) {
			el.classList.add('vlock')
		} else {
			el.classList.remove('vlock')
		}
	},
	updated(el, binding) {
		if (binding.value) {
			el.classList.add('vlock')
		} else {
			el.classList.remove('vlock')
		}
	},
}
export default vLock
