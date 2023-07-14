<script setup lang="ts">

</script>

<template>
	<div class="flex flex-col items-center justify-evenly text-center">
		<p class="text-5xl font-bold">
			<span class="text-error">404</span>
			<br>
			<span>Page Not Found</span>
			<br>
			<span class="text-2xl text-primary">Meow!</span>
		</p>
		<button class="btn btn-error rounded">
			<RouterLink to="/">
				Go back to Home!
			</RouterLink>
		</button>
	</div>
</template>
