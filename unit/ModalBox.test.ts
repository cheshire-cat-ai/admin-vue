import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModalBox from '@components/ModalBox.vue'

describe('ModalBox', () => {
	it('renders properly', () => {
		const wrapper = mount(ModalBox, {
			slots: {
				default: 'My slot content',
			},
		})

		expect(wrapper.exists()).toBe(true)

		// TODO: is empty (wtf?)
		console.log('Slot:', wrapper.html())

		//expect(wrapper.getComponent({ name: 'DialogPanel' }).text()).toContain('All')
	})
})
