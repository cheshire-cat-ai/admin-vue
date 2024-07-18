import { apiClient, tryRequest } from '@services/ApiService'
import type { UserCreate, UserCredentials, UserUpdate } from 'ccat-api'

/*
 * This is a service that is used to manage the users of the Cheshire Cat.
 */
const UserService = Object.freeze({
	getUsers: async () => {
		return await tryRequest(apiClient?.api?.users.readUsers(), 'Getting all the users', 'Unable to fetch users')
	},
	getUser: async (id: string) => {
		return await tryRequest(apiClient?.api?.users.readUser(id), 'The selected user id does not exist', 'Unable to get the user')
	},
	impersonateUser: async (credentials: UserCredentials) => {
		return await tryRequest(
			apiClient?.api?.userAuth.authToken(credentials),
			`Impersonating the user ${credentials.username}`,
			`Unable to impersonate the user ${credentials.username}`,
		)
	},
	getAvailablePermissions: async () => {
		return await tryRequest(
			apiClient?.api?.userAuth.getAvailablePermissions(),
			'Getting all the available permissions',
			'Unable to fetch the available permissions',
		)
	},
	createUser: async (user: UserCreate) => {
		return await tryRequest(
			apiClient?.api?.users.createUser(user),
			'All in-memory collections were wiped',
			'Unable to wipe the in-memory collections',
		)
	},
	updateUser: async (id: string, body: UserUpdate) => {
		return await tryRequest(
			apiClient?.api?.users.updateUser(id, body),
			`The user ${id} was updated successfully`,
			`Unable to update user ${id}`,
		)
	},
	deleteUser: async (id: string) => {
		return await tryRequest(apiClient?.api?.users.deleteUser(id), `The user ${id} was deleted successfully`, `Unable to delete user ${id}`)
	},
})

export default UserService
