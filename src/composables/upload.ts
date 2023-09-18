import { useRabbitHole } from '@stores/useRabbitHole'
import { AcceptedMemoryTypes } from 'ccat-api'

const filesStore = useRabbitHole()
const { sendFile, sendMemory, sendWebsite, getAllowedMimetypes } = filesStore

/**
 * A composable method to upload file to the Rabbit Hole based on file type
 * @param category The type of file who is going to ask for in the file dialog box
 */
export function uploadToRabbitHole() {
	const upload = async (category: 'memory' | 'content' | 'web', data?: File | string) => {
		const { open: openDialog, onChange: onFileUpload } = useFileDialog()

		const allowedMimetypes: string[] = []

		const sendContent = category == 'memory' ? sendMemory : sendFile

		onFileUpload(files => {
			if (files == null) return
			for (const file of files) sendContent(file)
		})

		if (category == 'memory') allowedMimetypes.push(...AcceptedMemoryTypes)
		else if (category == 'content') {
			const mimetypes = (await getAllowedMimetypes()) ?? []
			allowedMimetypes.push(...mimetypes)
		}

		if (category == 'web' && typeof data == 'string') sendWebsite(data)
		else if (data instanceof File && allowedMimetypes.includes(data.type)) sendContent(data)
		else if (category != 'web' && typeof data == 'string')
			sendContent(new File([new Blob([data])], category, { type: 'text/plain' }))
		else openDialog({ accept: allowedMimetypes.join(',') })
	}

	return {
		upload
	}
}
