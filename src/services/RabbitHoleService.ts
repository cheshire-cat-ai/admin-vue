import { post, tryRequest } from '@/api'
import type { FileResponse, MemoryResponse, WebResponse } from '@models/RabbitHole'

/*
 * This service is used to send files down to the rabbit hole.
 * Meaning this service sends files to the backend.
 */
const RabbitHoleService = Object.freeze({
  sendFile: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const result = await tryRequest(
      post<FileResponse>('/rabbithole/', formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }), 
      "Language model embedder updated successfully", 
      "Language model embedder couldn't be updated",
      "Sending the embedder settings to the cat"
    )
    return result.data
  },
  sendWeb: async (url: string) => {
    const result = await tryRequest(
      post<WebResponse>('/rabbithole/web/', { url }), 
      "Language model embedder updated successfully", 
      "Language model embedder couldn't be updated",
      "Sending the embedder settings to the cat"
    )
    return result.data
  },
  sendMemory: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const result = await tryRequest(
      post<MemoryResponse>('/rabbithole/memory/', formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }), 
      "Language model embedder updated successfully", 
      "Language model embedder couldn't be updated",
      "Sending the embedder settings to the cat"
    )
    return result.data
  },
})

export default RabbitHoleService
