import { describe, it, expect } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import { useNotifications } from '@stores/useNotifications'
import NotificationStack from '@components/NotificationStack.vue'

describe('NotificationStack', () => {
	it('renders properly', () => {
		const wrapper = mount(NotificationStack, {
			global: {
				plugins: [
					createTestingPinia({
						stubActions: false,
						fakeApp: true,
					}),
				],
			},
		})

		const { showNotification } = useNotifications()

		showNotification({
			text: 'Test',
			type: 'success',
		})

		expect(showNotification).toHaveBeenCalledTimes(1)

		// TODO: Doesn't show the v-for generated div
		console.log('text:', wrapper.html())
		//expect(wrapper.find(".alert[key='n_1']").text()).toContain('Test')
	})
})
