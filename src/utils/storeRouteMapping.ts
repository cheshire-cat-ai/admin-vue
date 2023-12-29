import { useEmbedderConfig } from '@/stores/useEmbedderConfig'
import { useLLMConfig } from '@/stores/useLLMConfig'
import { useMemory } from '@/stores/useMemory'
import { usePlugins } from '@/stores/usePlugins'

export default function useStoreMapping() {
	const storeEmbedder = useEmbedderConfig()
	const storeLLM = useLLMConfig()
	const storePlugins = usePlugins()
	const storeMemory = useMemory()

	const storeMapping = {
		embedders: storeEmbedder,
		providers: storeLLM,
		memory: storeMemory,
		plugins: storePlugins,
	}

	return { storeMapping }
}
