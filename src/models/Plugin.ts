/**
 * Defines the structure of a plugin object.
 */
export interface Plugin {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly author_name: string
  readonly author_url: string
  readonly plugin_url: string
  readonly tags: string
  readonly thumb: string
  readonly version: string
}

export interface PluginsResponse {
  installed: Plugin[]
  registry: Plugin[]
}
