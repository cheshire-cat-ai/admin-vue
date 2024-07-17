import tsconfigPaths from 'vite-tsconfig-paths'
import { configDefaults, defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { HeadlessUiResolver, VueUseComponentsResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import Unfonts from 'unplugin-fonts/vite'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
	plugins: [
		vue(),
		AutoImport({
			dts: true,
			imports: ['vue', 'vue-router', '@vueuse/core', 'pinia', 'vitest'],
			eslintrc: {
				enabled: true,
			},
			dirs: ['./src/composables', './src/utils'],
		}),
		Components({
			dts: true,
			resolvers: [HeadlessUiResolver({ prefix: '' }), IconsResolver({ prefix: '' }), VueUseComponentsResolver()],
		}),
		Icons({ autoInstall: true }),
		Unfonts({
			custom: {
				families: [
					{
						name: 'Rubik',
						local: 'Rubik',
						src: './src/assets/fonts/*.ttf',
					},
				],
				display: 'auto',
				preload: true,
				prefetch: false,
			},
		}),
		tsconfigPaths(),
		{
			name: 'configure-token',
			configureServer(server) {
				return () => {
					server.middlewares.use(async (_, res, next) => {
						const output = await (
							await fetch('http://localhost:1865/auth/token', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify({
									username: 'user',
									password: 'user',
								}),
							})
						).json()
						res.setHeader('Set-Cookie', `ccat_user_token=${output.access_token}`)
						next()
					})
				}
			},
		},
	],
	test: {
		environment: 'jsdom',
		globals: true,
		exclude: [...configDefaults.exclude, 'e2e/*'],
	},
	server: {
		port: 3000,
		open: false,
		host: true,
	},
	build: {
		outDir: 'dist',
		assetsDir: 'assets',
		cssCodeSplit: false,
		rollupOptions: {
			output: {
				minifyInternalExports: true,
				entryFileNames: 'assets/cat.js',
				assetFileNames: info => `assets/${info.name?.endsWith('css') ? 'cat' : '[name]'}[extname]`,
				chunkFileNames: 'chunk.js',
				manualChunks: () => 'chunk.js',
				generatedCode: {
					preset: 'es2015',
					constBindings: true,
					objectShorthand: true,
				},
			},
		},
	},
})
