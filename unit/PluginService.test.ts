import type { Plugin } from '@/models/Plugin'

describe('PluginService', () => {
    it("GET list of available plugins", async () => {
        const PluginService = (await import('@services/PluginService')).default

        expectTypeOf(await PluginService.getPlugins()).toEqualTypeOf<Array<Plugin>>()
    })
})