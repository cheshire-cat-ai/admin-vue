import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageBox from '@components/MessageBox.vue'

describe('MessageBox', () => {
	it('renders properly for user', () => {
		const wrapper = mount(MessageBox, {
			props: {
				sender: 'user',
				text: 'Hello dear cat!',
				when: new Date(),
			},
		})

		expect(wrapper.find('.chat-image').text()).toContain('🙂')

		expect(wrapper.find('.chat-bubble p').html()).toContain('<p>Hello dear cat!</p>')

		expect(wrapper.find('.chat-bubble button').exists()).toBe(false)

		expect(wrapper.findComponent({ name: 'SidePanel' }).exists()).toBe(false)
	})
	it('renders properly for bot', () => {
		const wrapper = mount(MessageBox, {
			props: {
				sender: 'bot',
				text: 'Hello dear human!',
				when: new Date(),
				why: {},
			},
		})

		expect(wrapper.find('.chat-image').text()).toContain('😺')

		expect(wrapper.find('.chat-bubble p').html()).toContain('<p>Hello dear human!</p>')

		expect(wrapper.find('.chat-bubble button').exists()).toBe(true)

		expect(wrapper.findComponent({ name: 'SidePanel' }).exists()).toBe(true)
	})
})
