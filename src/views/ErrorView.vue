<script setup lang="ts"></script>

<template>
	<div class="flex w-full flex-col items-center justify-evenly text-center">
		<p class="text-5xl font-bold">
			<span class="text-error">404</span>
			<br />
			<span>Cat Not Found</span>
			<br />
			<span class="text-2xl text-error">You’ve stumbled down the wrong rabbit hole!</span>
		</p>
		<button class="btn btn-error">
			<RouterLink to="/"> Go back to Home! </RouterLink>
		</button>
	</div>
</template>
