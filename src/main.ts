import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { defineRule } from 'vee-validate'
import AllRules from '@vee-validate/rules'
import vLock from '@/directives/vLock'

Object.keys(AllRules).forEach(rule => {
	defineRule(rule, AllRules[rule])
})

import App from '@/App.vue'
import router from '@/router'

import 'unfonts.css'
import 'animate.css'
import '@assets/main.css'
import { cloneDeep } from 'lodash'

const app = createApp(App)

const pinia = createPinia()

pinia.use(({ store }) => {
	const state = cloneDeep(store.$state)
	store.$reset = () => store.$patch(state)
})
app.use(pinia)
app.use(router)
app.directive('lock', vLock)

app.mount('#app')
