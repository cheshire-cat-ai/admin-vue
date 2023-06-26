import type { FileResponse, WebResponse } from 'ccat-api'

export const AcceptedContentTypes = [
  'text/plain', 
  'text/markdown', 
  'application/pdf'
] as const

export type RabbitHoleResponse = FileResponse | WebResponse | Record<string, unknown>