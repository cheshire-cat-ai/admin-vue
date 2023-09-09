/**
 * This is a service that is used to log messages for debugging purposes.
 * It doesn't do anything in production mode.
 */
const LogService = Object.freeze({
	error: (...args: unknown[]) => {
		if (import.meta.env.MODE === 'development') {
			console.error('🐱 Log:', ...args)
		}
	},
	success: (...args: unknown[]) => {
		if (import.meta.env.MODE === 'development') {
			console.log('🐱 Log:', ...args)
		}
	},
})

export default LogService
