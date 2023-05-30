import { AppFeatures } from '@models/AppFeatures'

const CORE_HOST = (window as any).catCoreConfig.CORE_HOST
const CORE_PORT = (window as any).catCoreConfig.CORE_PORT
const CORE_USE_SECURE_PROTOCOLS = (window as any).catCoreConfig.CORE_USE_SECURE_PROTOCOLS
const useProtocol = CORE_USE_SECURE_PROTOCOLS ? 's' : ''

/**
 * Returns the application configuration.
 * It is wrapped in a function to ensure the configuration is not mutated.
 */
const config: Config = {
  mode: import.meta.env.MODE,
  socketTimeout: 10000,
  features: [
    AppFeatures.FileUpload,
    AppFeatures.AudioRecording,
    AppFeatures.Settings,
    AppFeatures.Plugins,
    AppFeatures.WebsiteScraping
  ],
  endpoints: {
    chat: `ws${useProtocol}://${CORE_HOST}:${CORE_PORT}/ws`,
    rabbitHole: `http${useProtocol}://${CORE_HOST}:${CORE_PORT}/rabbithole/`,
    allLLM: `http${useProtocol}://${CORE_HOST}:${CORE_PORT}/settings/llm/`,
    allEmbedders: `http${useProtocol}://${CORE_HOST}:${CORE_PORT}/settings/embedder/`,
    plugins: `http${useProtocol}://${CORE_HOST}:${CORE_PORT}/plugins/`,
    wipeCollections: `http${useProtocol}://${CORE_HOST}:${CORE_PORT}/memory/wipe_collections/`
  }
}

export interface Config {
  readonly mode: string
  readonly socketTimeout: number
  readonly features: AppFeatures[]
  readonly endpoints: {
    readonly chat: string
    readonly rabbitHole: string
    readonly allLLM: string
    readonly allEmbedders: string
    readonly plugins: string
    readonly wipeCollections: string
  }
}

export default config
