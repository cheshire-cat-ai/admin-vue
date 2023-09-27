/**
 *
 * @param fileName the file name to set when downloaded
 * @returns The download method
 */
export function downloadContent(fileName = 'output') {
	const download = (content: string | object) => {
		const isObject = typeof content == 'object'

		const output = isObject ? JSON.stringify(content, undefined, 2) : content

		const element = document.createElement('a')
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(output))
		element.setAttribute('download', `${fileName}.${isObject ? 'json' : 'txt'}`)
		element.style.display = 'none'
		document.body.appendChild(element)
		element.click()
		document.body.removeChild(element)
	}

	return {
		download,
	}
}
