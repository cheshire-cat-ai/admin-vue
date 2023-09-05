/**
 * This module defines and export a collection of functions that are related to error management or error manipulation
 * commonly used throughout the application.
 */

/**
 * Returns the error message from an error or error-like object.
 * If the value is not an error or error-like object, the unknownError argument is returned.
 */
export const getErrorMessage = (error: unknown, unknownError = 'Unknown error') => {
	if (isApiError(error)) return error.body.detail.error
	if (isError(error) || isErrorLikeObject(error)) return error.message
	if (isString(error)) return error

	return unknownError
}
