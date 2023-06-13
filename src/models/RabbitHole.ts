export const AcceptedContentTypes = ['text/plain', 'text/markdown', 'application/pdf'] as const

export interface FileResponse {
  'content-type': typeof AcceptedContentTypes[number]
  filename: string
  info: string
}

export interface WebResponse {
  url: string
  info: string
}

export interface MemoryResponse {
  filename: string
  info: string
}

export type RabbitHoleResponse = FileResponse | WebResponse | MemoryResponse