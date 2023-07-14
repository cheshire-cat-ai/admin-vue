<script setup lang="ts">

</script>

<template>
	<div class="flex flex-col items-center justify-evenly text-center">
		<p class="text-5xl font-bold">
			<span class="text-error">404</span>
			<br>
			<span class="text-neutral">{{ $t('error.not_found') }}</span>
			<br>
			<span class="text-2xl text-primary">Meow!</span>
		</p>
		<button class="btn-error btn rounded">
			<RouterLink to="/">
				{{ $t('error.go_back') }}
			</RouterLink>
		</button>
	</div>
</template>
