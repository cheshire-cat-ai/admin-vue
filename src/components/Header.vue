<script setup lang="ts"></script>

<template>
	<div class="navbar sticky top-0 z-30 min-h-fit bg-base-100 font-medium shadow-md md:px-[5%] lg:px-[10%]">
		<div class="navbar-start">
			<RouterLink to="/" class="shrink-0 !bg-transparent">
				<img src="@assets/logo.svg" class="hidden size-12 cursor-pointer dark:brightness-0 dark:invert md:block" />
			</RouterLink>
			<Menu v-slot="{ open }" as="div" class="relative inline-block rounded-md md:hidden">
				<MenuButton class="btn btn-circle btn-ghost" title="Menu">
					<heroicons-x-mark-20-solid v-if="open" class="swap-on size-6" />
					<heroicons-bars-3-solid v-else class="swap-off size-6" />
				</MenuButton>
				<Transition
					enterActiveClass="transition duration-200 ease-out"
					enterFromClass="transform scale-90 opacity-0"
					enterToClass="transform scale-100 opacity-100"
					leaveActiveClass="transition duration-200 ease-in"
					leaveFromClass="transform scale-100 opacity-100"
					leaveToClass="transform scale-90 opacity-0">
					<MenuItems
						as="ul"
						class="menu menu-md absolute left-0 z-50 mt-4 w-min origin-top-left gap-2 whitespace-nowrap rounded-md bg-base-100 shadow-xl">
						<MenuItem as="li">
							<RouterLink to="/"> <heroicons-home-20-solid class="size-4" /> Home </RouterLink>
						</MenuItem>
						<MenuItem as="li">
							<RouterLink :key="$route.fullPath" :to="{ path: '/memory' }"> <ph-brain-fill class="size-4" /> Memory </RouterLink>
						</MenuItem>
						<MenuItem as="li">
							<RouterLink :key="$route.fullPath" :to="{ path: '/plugins' }"> <ph-plug-fill class="size-4" /> Plugins </RouterLink>
						</MenuItem>
						<MenuItem as="li">
							<RouterLink :key="$route.fullPath" :to="{ path: '/settings' }" :class="{ active: $route.path === '/settings' }">
								<heroicons-cog-6-tooth-20-solid class="size-4" /> Settings
							</RouterLink>
						</MenuItem>
						<MenuItem as="li">
							<a href="https://cheshire-cat-ai.github.io/docs/" target="_blank"> <heroicons-document-text-solid class="size-4" /> Docs </a>
						</MenuItem>
					</MenuItems>
				</Transition>
			</Menu>
		</div>
		<div class="navbar-center">
			<RouterLink to="/" class="shrink-0 !bg-transparent">
				<img src="@assets/logo.svg" class="size-12 cursor-pointer dark:brightness-0 dark:invert md:hidden" />
			</RouterLink>
			<ul class="menu menu-horizontal menu-md hidden gap-4 p-0 md:flex">
				<li>
					<RouterLink to="/"> <heroicons-home-20-solid class="size-4" /> Home </RouterLink>
				</li>
				<li>
					<RouterLink :key="$route.fullPath" :to="{ path: '/memory' }"> <ph-brain-fill class="size-4" /> Memory </RouterLink>
				</li>
				<li>
					<RouterLink :key="$route.fullPath" :to="{ path: '/plugins' }"> <ph-plug-fill class="size-4" /> Plugins </RouterLink>
				</li>
				<li>
					<RouterLink :key="$route.fullPath" :to="{ path: '/settings' }" :class="{ active: $route.path === '/settings' }">
						<heroicons-cog-6-tooth-20-solid class="size-4" /> Settings
					</RouterLink>
				</li>
				<li>
					<a href="https://cheshire-cat-ai.github.io/docs/" target="_blank"> <heroicons-document-text-solid class="size-4" /> Docs </a>
				</li>
			</ul>
		</div>
		<div class="navbar-end">
			<ThemeButton />
		</div>
	</div>
</template>
