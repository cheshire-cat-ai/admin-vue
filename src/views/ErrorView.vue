<script setup lang="ts">

</script>

<template>
	<div class="flex w-full flex-col items-center justify-evenly text-center">
		<p class="text-5xl font-bold">
			<span class="text-error">404</span>
			<br>
			<span class="text-neutral">{{ $t('error.not_found') }}</span>
			<br>
			<span class="text-2xl text-error">You’ve stumbled down the wrong rabbit hole!</span>
		</p>
		<button class="btn btn-error">
			<RouterLink to="/">
				{{ $t('error.go_back') }}
			</RouterLink>
		</button>
	</div>
</template>
