import { usePlugins } from '@stores/usePlugins'
import { useRabbitHole } from '@stores/useRabbitHole'
import { AcceptedMemoryTypes, AcceptedPluginTypes } from 'ccat-api'

const { installPlugin } = usePlugins()
const { sendFile, sendMemory, sendWebsite, getAllowedMimetypes } = useRabbitHole()

/**
 * A composable method to upload file to the Rabbit Hole based on file type
 * @param category The type of file who is going to ask for in the file dialog box
 */
export function uploadContent() {
	const upload = async (category: 'memory' | 'content' | 'web' | 'plugin', data?: File | string) => {
		const { open: openDialog, onChange: onFileUpload } = useFileDialog()

		const allowedMimetypes: string[] = []

		const sendContent = category == 'plugin' ? installPlugin : category == 'memory' ? sendMemory : sendFile

		onFileUpload(files => {
			if (files == null) return
			for (const file of files) sendContent(file)
		})

		if (category == 'memory') allowedMimetypes.push(...AcceptedMemoryTypes)
		else if (category == 'plugin') allowedMimetypes.push(...AcceptedPluginTypes)
		else if (category == 'content') {
			const mimetypes = (await getAllowedMimetypes()) ?? []
			allowedMimetypes.push(...mimetypes)
		}

		if (category == 'web' && typeof data == 'string') sendWebsite(data)
		else if (data instanceof File && allowedMimetypes.includes(data.type)) sendContent(data)
		else if (category != 'web' && typeof data == 'string') sendContent(new File([new Blob([data])], category, { type: 'text/plain' }))
		else openDialog({ accept: allowedMimetypes.join(',') })
	}

	return {
		upload,
	}
}
