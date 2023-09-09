import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SelectBox from '@components/SelectBox.vue'

describe('SelectBox', () => {
	it('renders properly', () => {
		const wrapper = mount(SelectBox, {
			props: {
				list: [{ label: 'All', value: 'all' }],
			},
		})

		expect(wrapper.getComponent({ name: 'ListboxButton' }).text()).toContain('All')
	})
})
