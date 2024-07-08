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
		headers: {
			'set-cookie':
				'ccat_user_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0OTZlZGJmNS1jNzIyLTQ3N2ItOTEzMi04ZDQyYmJiZjY2ZTkiLCJ1c2VybmFtZSI6ImFkbWluIiwicGVybWlzc2lvbnMiOnsiU1RBVFVTIjpbIldSSVRFIiwiRURJVCIsIkxJU1QiLCJSRUFEIiwiREVMRVRFIl0sIk1FTU9SWSI6WyJXUklURSIsIkVESVQiLCJMSVNUIiwiUkVBRCIsIkRFTEVURSJdLCJDT05WRVJTQVRJT04iOlsiV1JJVEUiLCJFRElUIiwiTElTVCIsIlJFQUQiLCJERUxFVEUiXSwiU0VUVElOR1MiOlsiV1JJVEUiLCJFRElUIiwiTElTVCIsIlJFQUQiLCJERUxFVEUiXSwiTExNIjpbIldSSVRFIiwiRURJVCIsIkxJU1QiLCJSRUFEIiwiREVMRVRFIl0sIkVNQkVEREVSIjpbIldSSVRFIiwiRURJVCIsIkxJU1QiLCJSRUFEIiwiREVMRVRFIl0sIkFVVEhfSEFORExFUiI6WyJXUklURSIsIkVESVQiLCJMSVNUIiwiUkVBRCIsIkRFTEVURSJdLCJVU0VSUyI6WyJXUklURSIsIkVESVQiLCJMSVNUIiwiUkVBRCIsIkRFTEVURSJdLCJVUExPQUQiOlsiV1JJVEUiLCJFRElUIiwiTElTVCIsIlJFQUQiLCJERUxFVEUiXSwiUExVR0lOUyI6WyJXUklURSIsIkVESVQiLCJMSVNUIiwiUkVBRCIsIkRFTEVURSJdLCJBRE1JTiI6WyJXUklURSIsIkVESVQiLCJMSVNUIiwiUkVBRCIsIkRFTEVURSJdLCJTVEFUSUMiOlsiV1JJVEUiLCJFRElUIiwiTElTVCIsIlJFQUQiLCJERUxFVEUiXX0sImV4cCI6MTcyMDUzMTI4OX0.iyVc9Emh9ddf8bzVnofp2NLWS-4wmcyQuYAaY-_6FQg',
		},
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
