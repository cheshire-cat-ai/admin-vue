/**
 * This module defines and exports a service that is used to send files to the backend.
 * A service is a singleton object that provides a simple interface for performing backend-related tasks such as
 * sending or receiving data.
 */
import LogService from '@services/LogService'
import { RabbitHole } from '@/api'

/*
 * This service is used to send files down to the rabbit hole.
 * Meaning this service sends files to the backend.
 */
const RabbitHoleService = Object.freeze({
  sendFile: async (file: File) => {
    const result = await RabbitHole.sendFile(file)

    LogService.print('Sending a file to the rabbit hole')

    return result.data
  },
  sendWeb: async (url: string) => {
    const result = await RabbitHole.sendWeb(url)

    LogService.print('Sending a website content to the rabbit hole')

    return result.data
  },
  sendMemory: async (file: File) => {
    const result = await RabbitHole.sendMemory(file)

    LogService.print('Sending a bunch of memories to the rabbit hole')

    return result.data
  },
})

export default RabbitHoleService
