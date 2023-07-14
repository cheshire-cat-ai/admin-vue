<script setup lang="ts">
</script>

<template>
	<div class="navbar sticky top-0 z-40 min-h-fit bg-base-100 font-medium shadow-xl md:px-[5%] lg:px-[10%]">
		<div class="navbar-start">
			<RouterLink to="/" class="shrink-0 !bg-transparent">
				<img src="@assets/logo.svg" class="hidden h-12 w-12 cursor-pointer md:block">
			</RouterLink>
			<Menu v-slot="{ open }" as="div" class="relative inline-block rounded-md md:hidden">
				<MenuButton class="btn-ghost btn-square btn" title="Menu">
					<heroicons-x-mark-20-solid v-if="open" class="swap-on h-6 w-6" />
					<heroicons-bars-3-solid v-else class="swap-off h-6 w-6" />
				</MenuButton>
				<Transition enterActiveClass="transition duration-200 ease-out"
					enterFromClass="transform scale-90 opacity-0" enterToClass="transform scale-100 opacity-100"
					leaveActiveClass="transition duration-200 ease-in" leaveFromClass="transform scale-100 opacity-100"
					leaveToClass="transform scale-90 opacity-0">
					<MenuItems as="ul"
						class="menu menu-md absolute left-0 z-50 mt-4 w-min origin-top-left gap-2 whitespace-nowrap rounded-md bg-base-100 p-2 shadow-xl">
						<MenuItem as="li">
							<RouterLink to="/">
								🏠️ {{ $t('headers.home') }}
							</RouterLink>
						</MenuItem>
						<MenuItem as="li">
							<RouterLink to="/memory">
								🧠 {{ $t('headers.memory') }}
							</RouterLink>
						</MenuItem>
						<MenuItem as="li">
							<RouterLink to="/plugins">
								🔌 {{ $t('headers.plugins') }}
							</RouterLink>
						</MenuItem>
						<MenuItem as="li">
							<RouterLink to="/settings">
								⚙️ {{ $t('headers.settings') }}
							</RouterLink>
						</MenuItem>
						<MenuItem as="li">
							<a href="https://cheshire-cat-ai.github.io/docs/" target="_blank">📖 {{ $t('headers.docs') }}</a>
						</MenuItem>
					</MenuItems>
				</Transition>
			</Menu>
		</div>
		<div class="navbar-center">
			<RouterLink to="/" class="shrink-0 !bg-transparent">
				<img src="@assets/logo.svg" class="h-12 w-12 cursor-pointer md:hidden">
			</RouterLink>
			<ul class="menu menu-horizontal menu-md hidden gap-4 md:flex">
				<li>
					<RouterLink to="/">
						🏠️ {{ $t('headers.home') }}
					</RouterLink>
				</li>
				<li>
					<RouterLink to="/memory">
						🧠 {{ $t('headers.memory') }}
					</RouterLink>
				</li>
				<li>
					<RouterLink to="/plugins">
						🔌 {{ $t('headers.plugins') }}
					</RouterLink>
				</li>
				<li>
					<RouterLink to="/settings" :class="{ 'active': $route.path === '/settings' }">
						⚙️ {{ $t('headers.settings') }}
					</RouterLink>
				</li>
				<li><a href="https://cheshire-cat-ai.github.io/docs/" target="_blank">📖 {{ $t('headers.docs') }}</a></li>
			</ul>
		</div>
		<div class="navbar-end">
			<ThemeButton />
		</div>
	</div>
</template>
