/**
 * This module defines and exports a service that is used to send files to the backend.
 * A service is a singleton object that provides a simple interface for performing backend-related tasks such as
 * sending or receiving data.
 */
import LogService from '@services/LogService'
import { toJSON } from '@utils/commons'
import { config, authFetch } from '@/config'

const endpointFile = config.endpoints.rabbitHole
const endpointWeb = config.endpoints.rabbitHole + 'web/'
const endpointMemory = config.endpoints.rabbitHole + 'memory/'

/*
 * This service is used to send files down to the rabbit hole.
 * Meaning this service sends files to the backend.
 */
const RabbitHoleService = Object.freeze({
  sendFile: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const options = { method: 'POST', body: formData }

    LogService.print('Sending a file to the rabbit hole', { endpointFile, options })

    return await authFetch(endpointFile, options).then<FileResponse>(toJSON)
  },
  sendWeb: async (url: string) => {
    const options = { 
      method: 'POST', 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }) 
    }

    LogService.print('Sending a website content to the rabbit hole', { endpointWeb, options })

    return await authFetch(endpointWeb, options).then<WebResponse>(toJSON)
  },
  sendMemory: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const options = { method: 'POST', body: formData }

    LogService.print('Sending a bunch of memories to the rabbit hole', { endpointMemory, options })

    return await authFetch(endpointMemory, options).then<MemoryResponse>(toJSON)
  },
})

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

export default RabbitHoleService
