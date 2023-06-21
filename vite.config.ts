import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite"
import IconsResolver from "unplugin-icons/resolver"
import { HeadlessUiResolver } from 'unplugin-vue-components/resolvers'
import Components from "unplugin-vue-components/vite"
import Unfonts from 'unplugin-fonts/vite'
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      dts: true,
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        'pinia',
        'vue-i18n'
      ],
      eslintrc: {
        enabled: true
      }
    }),
    Components({
      dts: true,
      resolvers: [
        HeadlessUiResolver({ prefix: "" }),
        IconsResolver({ prefix: "" })
      ]
    }),
    Icons({ autoInstall: true }),
    Unfonts({
      custom: {
        families: [{
          name: 'Ubuntu',
          local: 'Ubuntu',
          src: './src/assets/fonts/*.ttf'
        }],
        display: 'auto',
        preload: true,
        prefetch: false,
      }
    }),
    VueI18nPlugin({
      include: resolve(
        dirname(fileURLToPath(import.meta.url)),
        "./src/locales/**"
      ),
      runtimeOnly: false,
    }),
    tsconfigPaths()
  ],
  server: {
    port: 3000,
    open: false,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        minifyInternalExports: true,
        entryFileNames: 'assets/cat.js',
        assetFileNames: (info) => `assets/${info.name?.endsWith('css') ? 'cat' : '[name]'}[extname]`,
        chunkFileNames: 'chunk.js',
        manualChunks: () => 'chunk.js',
        generatedCode: {
          preset: 'es2015',
          constBindings: true,
          objectShorthand: true
        }
      }
    }
  }
})
