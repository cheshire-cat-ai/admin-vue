declare global {
    interface Window {
        catCoreConfig: {
            readonly CORE_HOST: string
            readonly CORE_PORT: string | undefined
            readonly CORE_USE_SECURE_PROTOCOLS: boolean
            readonly API_KEY: string | undefined
        }
    }
}

export {}