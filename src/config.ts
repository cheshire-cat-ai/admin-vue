const CORE_HOST = window.catCoreConfig.CORE_HOST
const CORE_PORT = window.catCoreConfig.CORE_PORT
const CORE_USE_SECURE_PROTOCOLS = window.catCoreConfig.CORE_USE_SECURE_PROTOCOLS
const protocol = CORE_USE_SECURE_PROTOCOLS ? 's' : ''

enum AppFeatures {
  FileUpload,
  AudioRecording,
  Plugins,
  Settings,
  WebsiteScraping
}

interface Config {
  readonly mode: string
  readonly socketTimeout: number
  readonly features: AppFeatures[]
  readonly endpoints: {
    readonly chat: string
    readonly rabbitHole: string
    readonly allLLM: string
    readonly allEmbedders: string
    readonly plugins: string
    readonly wipeAllCollections: string
    readonly wipeConversation: string
    readonly wipeCollection: string
    readonly callMemory: string
  }
}

/**
 * Returns the readonly application configuration.
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
    chat: `ws${protocol}://${CORE_HOST}:${CORE_PORT}/ws`,
    rabbitHole: `http${protocol}://${CORE_HOST}:${CORE_PORT}/rabbithole/`,
    allLLM: `http${protocol}://${CORE_HOST}:${CORE_PORT}/settings/llm/`,
    allEmbedders: `http${protocol}://${CORE_HOST}:${CORE_PORT}/settings/embedder/`,
    plugins: `http${protocol}://${CORE_HOST}:${CORE_PORT}/plugins/`,
    wipeCollection: `http${protocol}://${CORE_HOST}:${CORE_PORT}/memory/collection/`,
    wipeAllCollections: `http${protocol}://${CORE_HOST}:${CORE_PORT}/memory/wipe-collections/`,
    wipeConversation: `http${protocol}://${CORE_HOST}:${CORE_PORT}/memory/working-memory/conversation-history/`,
    callMemory: `http${protocol}://${CORE_HOST}:${CORE_PORT}/memory/recall/`,
  }
}

/**
 * Makes an authenticated request to the endpoints by passing the access_token.
 */
const authFetch = (url: string, options: RequestInit = {}) => {
  const accessToken = window.catCoreConfig.API_KEY

  if (accessToken) {
    const headers = options.headers as Record<string, string> ?? {}
    headers["access_token"] = accessToken
    options.headers = headers
  }

  return fetch(url, options)
}

export {
  config,
  authFetch
}
