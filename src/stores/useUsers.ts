import UserService from '@services/UserService'
import { useNotifications } from '@stores/useNotifications'
import type { UsersListState } from '@stores/types'
import { remove } from 'lodash'
import type { UserCreate, UserUpdate } from 'ccat-api'
import { useMainStore } from './useMainStore'

export const useUsers = defineStore('users', () => {
	const currentState = reactive<UsersListState>({
		loading: false,
		data: [],
	})

	const { state: users, isLoading, execute: fetchUsers } = useAsyncState(UserService.getUsers, undefined, { resetOnExecute: false })
	const { state: perms } = useAsyncState(UserService.getAvailablePermissions, undefined, { resetOnExecute: false })

	const availablePerms = computed(() => perms.value?.data ?? {})

	watchEffect(() => {
		currentState.loading = isLoading.value
		currentState.data = users.value?.data
		currentState.error = users.value?.status === 'error' ? users.value.message : undefined
	})

	const { sendNotificationFromJSON } = useNotifications()
	const { cookie } = storeToRefs(useMainStore())

	const deleteUser = async (id: string) => {
		currentState.loading = true
		const result = await UserService.deleteUser(id)
		currentState.loading = false
		if (result.status == 'success' && currentState.data) {
			remove(currentState.data, v => v.id === id)
			fetchUsers()
		}
		return sendNotificationFromJSON(result)
	}

	const impersonateUser = async (username: string, password: string) => {
		currentState.loading = true
		const result = await UserService.impersonateUser({ username, password })
		if (result.status == 'success' && result.data) cookie.value = result.data.access_token
		currentState.loading = false
		return sendNotificationFromJSON(result)
	}

	const createUser = async (body: UserCreate) => {
		const result = await UserService.createUser(body)
		currentState.data?.push(result.data!)
		return sendNotificationFromJSON(result)
	}

	const updateUser = async (id: string, body: UserUpdate) => {
		const result = await UserService.updateUser(id, body)
		const index = currentState.data!.findIndex(v => v.id === id)
		if (index !== -1) currentState.data![index] = result.data!
		return sendNotificationFromJSON(result)
	}

	return {
		availablePerms,
		currentState,
		fetchUsers,
		deleteUser,
		createUser,
		updateUser,
		impersonateUser,
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useUsers, import.meta.hot))
}
