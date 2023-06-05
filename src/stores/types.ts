import type { LLMConfigDescriptor, LLMConfigMetaData } from '@models/LLMConfig'
import type { Plugin } from '@models/Plugin'
import type { Notification } from '@models/Notification'
import type { EmbedderConfigDescriptor, EmbedderConfigMetaData } from '@models/EmbedderConfig'
import type { JSONSettings } from '@models/JSONSchema'

/**
 * Defines a generic interface for defining the state of an asynchronous operation.
 */
export interface AsyncStateBase {
  loading: boolean
  error?: string
}

/**
 * Defines a generic interface for defining the state of an asynchronous operation that returns data.
 */
export interface AsyncState<TData> extends AsyncStateBase {
  data?: TData
}

/**
 * Defines the structure of the 'llmConfig' state.
 * This state contains information about the available language models.
 */
export interface LLMConfigState extends AsyncState<LLMConfigDescriptor> {
  selected?: LLMConfigMetaData['languageModelName']
  settings: Record<string, JSONSettings>
}

/**
 * Defines the structure of the 'notifications' state.
 * This state contains information about the notifications sent to the user.
 */
export interface NotificationsState {
  history: Notification[]
}

/**
 * Defines the structure of the 'plugins' state.
 * This state contains information about the installed plugins.
 */
export type PluginsState = AsyncState<Plugin[]>

/**
 * Defines the structure of the 'embedderConfig' state.
 * This state contains information about the available embedders.
 */
export interface EmbedderConfigState extends AsyncState<EmbedderConfigDescriptor> {
  selected?: EmbedderConfigMetaData['languageEmbedderName']
  settings: Record<string, JSONSettings>
}