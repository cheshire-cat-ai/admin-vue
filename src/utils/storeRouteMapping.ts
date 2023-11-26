import { useEmbedderConfig } from '@/stores/useEmbedderConfig'
import { useLLMConfig } from '@/stores/useLLMConfig'
import { useMemory } from '@/stores/useMemory'
import { usePlugins } from '@/stores/usePlugins'

const storeMapping: { [id: string]:  any } = {
  'embedders': useEmbedderConfig(),
  'providers': useLLMConfig(),
  'memory': useMemory(),
  'plugins': usePlugins(),
}

export default storeMapping