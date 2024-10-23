import { createRouter, createWebHistory } from 'vue-router'
import { useMemory } from '@stores/useMemory'

const router = createRouter({
	linkActiveClass: 'active',
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: () => import('@views/HomeView.vue'),
		},
		{
			path: '/settings',
			name: 'settings',
			component: () => import('@views/SettingsView.vue'),
			children: [
				{
					path: '',
					name: 'providers',
					component: () => import('@views/ProvidersView.vue'),
				},
				{
					path: '',
					name: 'embedders',
					component: () => import('@views/EmbeddersView.vue'),
				},
				{
					path: '',
					name: 'auth',
					component: () => import('@views/AuthView.vue'),
				},
			],
		},
		{
			path: '/memory',
			name: 'memory',
			component: () => import('@views/MemoryView.vue'),
			beforeEnter: async () => {
				await useMemory().fetchCollections()
			},
		},
		{
			path: '/plugins',
			name: 'plugins',
			component: () => import('@views/PluginsView.vue'),
		},
		{
			path: '/:pathMatch(.*)*',
			name: 'error',
			component: () => import('@views/ErrorView.vue'),
		},
	],
})

export default router
