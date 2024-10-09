<script setup lang="ts">
import { useUsers } from '@stores/useUsers'
import { startCase, lowerCase, cloneDeep } from 'lodash'
import { apiClient, tryRequest } from '@services/ApiService'
import ModalBox from '@components/ModalBox.vue'
import SidePanel from '@components/SidePanel.vue'
import type { Status, UserCreate, UserResponse, UserUpdate } from 'ccat-api'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'

const getStatus = async () => {
	const result = await tryRequest(apiClient?.api?.status.home(), 'Getting Cheshire Cat status', 'Unable to fetch Cheshire Cat status')
	return result.data
}

const { state: cat } = useAsyncState(getStatus, {} as Status, { resetOnExecute: false })
const userStore = useUsers()
const { can, cannot } = usePerms(), updateList = ref(1)
const { deleteUser, updateUser, createUser } = userStore
const { currentState, availablePerms } = storeToRefs(userStore)
const currentUser = ref<UserResponse & (UserCreate | UserUpdate)>()

const panelTitles = {
	embedder: 'Configure the Embedder',
	llm: 'Configure the Language Model',
	auth: 'Configure the Auth handler',
} as const

const sidePanel = ref<InstanceType<typeof SidePanel>>(),
	editPanel = ref<InstanceType<typeof SidePanel>>(),
	deleteModal = ref<InstanceType<typeof ModalBox>>()
const panelTitle = ref<string>('')

const openSidePanel = (title: keyof typeof panelTitles) => {
	panelTitle.value = panelTitles[title]
	sidePanel.value?.togglePanel()
}

const canSave = computed(() => {
	const user = currentUser.value
	const users = currentState.value.data?.filter(u => u.id !== user?.id)
	if (!user || !users) return false
	return (
		user.username.length > 0 &&
		!users.some(u => u.username === user.username) &&
		user.permissions !== undefined &&
		Object.values(user.permissions).reduce((acc, val) => acc + val.length, 0) > 0
	)
})

const createOrUpdateUser = () => {
	const userInfo: UserUpdate = {
		username: currentUser.value!.username,
		permissions: currentUser.value!.permissions ?? {},
		password: currentUser.value!.password,
	}
	if (currentUser.value?.id) updateUser(currentUser.value!.id, userInfo)
	else createUser(userInfo as UserCreate)
	editPanel.value?.togglePanel()
}

const userPermissions = computed({
    get: () => currentUser.value?.permissions ?? {},
    set: (value) => {
        currentUser.value!.permissions = value
    },
});

const fillAll = (resource: string) => {
	userPermissions.value[resource] = availablePerms.value[resource] ?? [];
	updateList.value += 1
};
</script>

<template>
	<div class="flex flex-col md:grid w-full auto-rows-min gap-8 self-center md:w-3/4 md:grid-cols-4">
		<div v-if="can('READ', 'STATUS')"
			class="flex flex-col items-center justify-center gap-2 rounded-md p-4 md:col-span-4">
			<p class="text-lg font-bold">
				Cheshire Cat AI - Version
				<span class="text-primary">
					{{ cat ? cat.version : 'unknown' }}
				</span>
			</p>
			<span v-if="cat">{{ cat.status }}</span>
		</div>
		<div
			class="flex flex-col items-center justify-between gap-8 rounded-lg bg-base-100 p-4 shadow-md md:col-span-2">
			<p class="text-xl font-bold">Large Language Model</p>
			<p class="text-center">Set and configure your favourite LLM from a list of supported providers</p>
			<RouterLink :to="{ name: 'providers' }" class="btn btn-primary btn-sm"
				:class="{ 'btn-disabled': cannot('WRITE', 'LLM') }" @click="openSidePanel('llm')">
				Configure
			</RouterLink>
		</div>
		<div
			class="flex flex-col items-center justify-between gap-8 rounded-lg bg-base-100 p-4 shadow-md md:col-span-2">
			<p class="text-xl font-bold">Embedder</p>
			<p class="text-center">Set a language embedder to help the Cat remember conversations and documents</p>
			<RouterLink :to="{ name: 'embedders' }" class="btn btn-primary btn-sm"
				:class="{ 'btn-disabled': cannot('WRITE', 'EMBEDDER') }" @click="openSidePanel('embedder')">
				Configure
			</RouterLink>
		</div>
		<div
			class="flex flex-col items-center justify-between gap-8 rounded-lg bg-base-100 p-4 shadow-md md:col-span-2 md:col-start-2">
			<p class="text-xl font-bold">Auth Handler</p>
			<p class="text-center">Set an auth handler to manage how your application authenticates with the Cat</p>
			<RouterLink :to="{ name: 'auth' }" class="btn btn-primary btn-sm"
				:class="{ 'btn-disabled': cannot('WRITE', 'AUTH_HANDLER') }" @click="openSidePanel('auth')">
				Configure
			</RouterLink>
		</div>
		<div v-if="can('LIST', 'USERS')" class="col-span-4 w-full overflow-x-auto rounded-md">
			<div class="flex items-center justify-between gap-4">
				<div class="w-36" />
				<p class="text-center text-lg font-bold">Users Management</p>
				<button class="btn btn-primary btn-sm rounded-md hover:shadow-lg" :disabled="cannot('WRITE', 'USERS')"
					@click="() => {
						currentUser = {
							id: '',
							username: '',
							permissions: {},
						}
						editPanel?.togglePanel()
					}">
					<ph-plus class="size-4" />
					Add new user
				</button>
			</div>
			<table class="table table-zebra">
				<thead>
					<tr class="border-b-2 border-neutral text-center text-sm text-primary">
						<th></th>
						<th>ID</th>
						<th>Name</th>
						<th class="hidden md:table-cell">Permissions</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item, index) in currentState.data" :key="item.id" class="text-center">
						<td>{{ index + 1 }}</td>
						<td>{{ item.id }}</td>
						<td>{{ item.username }}</td>
						<td class="hidden whitespace-break-spaces md:table-cell">
							{{
								Object.keys(item.permissions ?? {})
									.filter(r => item.permissions?.[r]?.length)
									.map(r => startCase(lowerCase(r)))
									.join(' - ')
							}}
						</td>
						<td>
							<div class="flex justify-center gap-2">
								<!--<div class="tooltip tooltip-left" data-tip="Impersonate">
									<button :disabled="item.username === jwt?.username" class="btn btn-square btn-success btn-xs">
										<ph-user class="size-4" />
									</button>
								</div>-->
								<div class="tooltip tooltip-left" data-tip="Edit">
									<button class="btn btn-square btn-info btn-xs" :disabled="cannot('EDIT', 'USERS')" @click="() => {
										currentUser = cloneDeep(item)
										editPanel?.togglePanel()
									}">
										<ph-pencil-fill class="size-4" />
									</button>
								</div>
								<div class="tooltip tooltip-left" data-tip="Delete">
									<button :disabled="cannot('DELETE', 'USERS')" class="btn btn-square btn-error btn-xs" @click="() => {
										currentUser = cloneDeep(item)
										deleteModal?.toggleModal()
									}">
										<ph-trash-fill class="size-4" />
									</button>
								</div>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
			<ModalBox ref="deleteModal">
				<div class="flex flex-col justify-center gap-4 text-neutral">
					<p class="text-lg font-bold">Are you sure you want to delete this user?</p>
					<p class="text-sm">
						You are trying to delete
						<span class="font-semibold">{{ currentUser!.username }}</span>
						. This action cannot be undone!
					</p>
					<div class="flex items-center justify-around gap-4">
						<button class="btn btn-outline btn-sm" @click="deleteModal?.toggleModal()">No</button>
						<button class="btn btn-error btn-sm" @click="deleteUser(currentUser!.id)">Yes</button>
					</div>
				</div>
			</ModalBox>
		</div>
		<SidePanel ref="editPanel" :title="currentUser?.id ? 'Edit user' : 'Create user'">
			<div class="flex grow flex-col gap-4">
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Username</span>
					</div>
					<input v-model="currentUser!.username" type="text" placeholder="Type a new username..."
						class="input input-sm input-bordered w-full" />
				</label>
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Password</span>
					</div>
					<input v-model="currentUser!.password" type="text" placeholder="Type a new password..."
						class="input input-sm input-bordered w-full" />
				</label>
				<div class="flex flex-col gap-2">
					<p class="font-medium text-neutral">Permissions</p>
					<label v-for="(l, r) of availablePerms" :key="r" class="form-control w-full">
						<div class="label py-0">
							<span class="label-text">{{ startCase(lowerCase(r)) }}</span>
						</div>
						<div class="label gap-2 py-0">
							<Listbox :key="updateList" :defaultValue="userPermissions[r]" multiple @update:modelValue="l => userPermissions[r] = l">
								<div class="relative rounded-lg grow">
									<ListboxButton v-slot="{ value }" class="flex w-full bg-base-100 p-2 cursor-default items-center justify-between gap-1 rounded-md text-left text-sm">
										<span class="block truncate font-semibold">{{ value.join(', ') }}</span>
										<heroicons-chevron-up-down-20-solid class="size-6" />
									</ListboxButton>
									<Transition enterActiveClass="transition duration-200 ease-out"
										enterFromClass="transform opacity-0" enterToClass="transform opacity-100"
										leaveActiveClass="transition duration-200 ease-in"
										leaveFromClass="transform opacity-100" leaveToClass="transform opacity-0">
										<ListboxOptions class="join bg-base-100 join-vertical absolute z-10 mt-4 w-full min-w-fit overflow-auto rounded-md text-sm shadow-lg">
											<ListboxOption v-for="perm in l" :key="perm" v-slot="{ active, selected }" as="template" :value="perm">
												<li :class="[
													active ? 'bg-primary !text-base-100' : '',
													selected ? 'bg-primary font-semibold text-base-100' : 'text-neutral',
													'join-item relative cursor-default select-none px-3 py-2',
												]">
													<span class="block truncate">{{ perm }}</span>
												</li>
											</ListboxOption>
										</ListboxOptions>
									</Transition>
								</div>
							</Listbox>
							<button class="btn btn-outline btn-info btn-xs ml-1" @click="fillAll(r)">All</button>
						</div>
					</label>
				</div>
				<div class="mt-auto flex gap-2">
					<button type="reset" class="btn btn-outline btn-sm grow normal-case">
						<heroicons-x-mark-20-solid class="size-4" />
						Cancel
					</button>
					<button type="submit" class="btn btn-primary btn-sm grow normal-case" :disabled="!canSave"
						@click="createOrUpdateUser()">
						<ph-floppy-disk-bold class="size-4" />
						{{ currentUser?.id ? 'Save' : 'Create' }}
					</button>
				</div>
			</div>
		</SidePanel>
		<SidePanel ref="sidePanel" :title="panelTitle">
			<RouterView @close="sidePanel?.togglePanel()" />
		</SidePanel>
	</div>
</template>
