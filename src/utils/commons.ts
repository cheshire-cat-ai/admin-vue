/**
 * This module defines and export a collection of utility functions that are commonly used throughout the application.
 * The functions are grouped by their purpose and exported as named exports.
 */

let ids = 0

/**
 * Generates a unique id of type number.
 * This function is commonly employed by components that need to generate unique ids for their children.
 */
export const uniqueId = () => ids += 1

/**
 * Returns the current timestamp in milliseconds.
 */
export const now = () => new Date().getTime()
