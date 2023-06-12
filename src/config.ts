enum AppFeatures {
  FileUpload,
  AudioRecording,
  Plugins,
  Settings,
  WebsiteScraping
}

/**
 * Returns the readonly application configuration.
 */
class Config {
  private static host = ''
  private static port: string | null = null
  static readonly mode = import.meta.env.MODE
  static secure = false
  static timeout = 10000
  static apiKey: string | null = null
  static readonly features: AppFeatures[] = [
    AppFeatures.FileUpload,
    AppFeatures.AudioRecording,
    AppFeatures.Settings,
    AppFeatures.Plugins,
    AppFeatures.WebsiteScraping
  ]

  static init(config: typeof window.catCoreConfig) {
    this.secure = config.CORE_USE_SECURE_PROTOCOLS
    this.host = config.CORE_HOST
    this.port = config.CORE_PORT
    this.apiKey = config.API_KEY
    return this
  }

  private static get addPort() {
    return this.port ? `:${this.port}` : ''
  }

  private static get addProtocol() {
    return this.secure ? 's' : ''
  }

  static get chat() {
    return `ws${this.addProtocol}://${this.host}${this.addPort}/ws`
  }

  static get baseUrl() {
    return `http${this.addProtocol}://${this.host}${this.addPort}/`
  }
}

export default Config.init(window.catCoreConfig)
