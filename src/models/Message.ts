/**
 * The base interface for all message types.
 * It defines the structure of a basic message.
 * The purpose of this type is to be extended by other message types.
 */
export interface MessageBase {
  readonly id: string | number
  readonly text: string
  readonly timestamp: number
}

/**
 * An interface for messages sent by the bot.
 */
export interface BotMessage extends MessageBase {
  readonly sender: 'bot'
  readonly why: any
}

/**
 * An interface for messages sent by the user.
 */
export interface UserMessage extends MessageBase {
  readonly sender: 'user'
}

/**
 * The union type for all message types.
 */
export type Message = BotMessage | UserMessage

/**
 * An interface for the response from the message service.
 */
export interface MessageResponse {
  error: false
  type: 'notification' | 'chat'
  content: string
  why: any
}

/**
 * An interface for the error response from the message service.
 */
export interface MessageError {
  error: true
  code: string
}

/**
 * An interface for the prompt settings to pass to the cat via websocket.
 */
export interface PromptSettings {
  [key: string]: boolean
}