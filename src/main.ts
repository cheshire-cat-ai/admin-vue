import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { abilitiesPlugin } from '@casl/vue'
import { defineAbility } from '@casl/ability'
import { defineRule } from 'vee-validate'
import { all as AllRules } from '@vee-validate/rules'
import vLock from '@/directives/vLock'
import App from '@/App.vue'
import router from '@/router'
import 'unfonts.css'
import 'animate.css'
import '@assets/main.css'
import { cloneDeep } from 'lodash'

Object.keys(AllRules).forEach(rule => {
	defineRule(rule, AllRules[rule])
})

const app = createApp(App)

const pinia = createPinia()

// eslint-disable-next-line @typescript-eslint/no-empty-function
const ability = defineAbility(() => {})

pinia.use(({ store }) => {
	const state = cloneDeep(store.$state)
	store.$reset = () => store.$patch(state)
})
app.use(pinia)
app.use(router)
app.use(abilitiesPlugin, ability, {
	useGlobalProperties: true,
})

app.directive('lock', vLock)

app.mount('#app')
