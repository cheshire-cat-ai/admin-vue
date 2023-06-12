import axios from "axios"
import type { EmbedderConfigDescriptor } from "@models/EmbedderConfig"
import type { LLMConfigDescriptor } from '@models/LLMConfig'
import type { JSONSettings } from "@models/JSONSchema"
import type { Memory } from "@models/Memory"
import type { Plugin } from '@models/Plugin'
import type { FileResponse, WebResponse, MemoryResponse } from "@models/RabbitHole"
import config from "@/config"

/**
 * API client to make requests to the endpoints and passing the access_token for authentication.
 */
const apiClient = axios.create({
  baseURL: config.baseUrl,
  timeout: config.timeout,
  headers: { 
    'access_token': config.apiKey,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(request => {
  console.log(request.headers)
  return request
}, error => error.toJSON())

apiClient.interceptors.response.use(response => response, error => error.toJSON())

const { get, post, put, delete: destroy } = apiClient

export const Embedders = Object.freeze({
  getAll: () => 
    get<EmbedderConfigDescriptor>('/settings/embedder/'),
  updateSettings: (name: string, settings: JSONSettings) => 
    put(`/settings/embedder/${name}`, settings),
})

export const LanguageModels = Object.freeze({
  getAll: () => 
    get<LLMConfigDescriptor>('/settings/llm/'),
  updateSettings: (name: string, settings: JSONSettings) => 
    put(`/settings/llm/${name}`, settings),
})

export const Memories = Object.freeze({
  wipeCollections: () => 
    destroy('/memory/wipe-collections/'),
  wipeSingleCollection: (collection: string) => 
    destroy(`/memory/collection/${collection}`),
  wipeCurrentConversation: () => 
    destroy('/memory/working-memory/conversation-history/'),
  recallMemory: (params: object) => 
    get<Memory>('/memory/recall/', { params }),
})

export const Plugins = Object.freeze({
  getAll: () => 
    get<{ plugins: Plugin[] }>('/plugins/'),
  toggle: (id: string) => 
    put(`/plugins/toggle/${id}`),
})

export const RabbitHole = Object.freeze({
  sendFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return post<FileResponse>('/rabbithole/', formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  },
  sendMemory: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return post<MemoryResponse>('/rabbithole/memory/', formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  },
  sendWeb: (url: string) => 
    post<WebResponse>('/rabbithole/web/', { url }),
})