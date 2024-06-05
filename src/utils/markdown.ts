import hljs from 'highlight.js'
import { Remarkable } from 'remarkable'
import { linkify } from 'remarkable/linkify'

const markdown = new Remarkable({
	html: true,
	breaks: true,
	xhtmlOut: true,
	typographer: true,
	highlight: (str, lang) => {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(str, { language: lang }).value
			} catch (_) {
				console.log(_)
			}
		}
		try {
			return hljs.highlightAuto(str).value
		} catch (_) {
			console.log(_)
		}
		return '' // use external default escaping
	},
}).use(linkify)

markdown.inline.ruler.enable(['sup', 'sub'])
markdown.core.ruler.enable(['abbr'])
markdown.block.ruler.enable(['footnote', 'deflist'])

export default markdown
