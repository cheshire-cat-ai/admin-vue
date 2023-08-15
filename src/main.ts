import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { defineRule } from 'vee-validate'
import AllRules from '@vee-validate/rules'

Object.keys(AllRules).forEach(rule => {
	defineRule(rule, AllRules[rule])
})

import App from '@/App.vue'
import router from '@/router'

import 'unfonts.css'
import 'animate.css'
import '@assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
