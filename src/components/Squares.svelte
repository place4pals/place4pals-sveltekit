<script lang="ts">
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
</script>

<div style="display:flex;flex-direction: row; justify-content: flex-start;">
	<div
		in:fly={{
			delay: 0,
			duration: 300,
			x: 0,
			y: -50,
			easing: expoOut
		}}
		style="cursor: pointer; border: 1px solid #000000; background-color: #898542; border-radius: 10px; padding: 5px; height: 50px; width: 50px"
	/>
	<div
		in:fly={{
			delay: 300,
			duration: 300,
			x: 0,
			y: -50,
			easing: expoOut
		}}
		style="cursor: pointer; border: 1px solid #000000; background-color: #8E84BC; border-radius: 10px; padding: 5px; height: 50px; width: 50px; margin-left: -20px; margin-top: 20px; z-index: 1;"
	/>
	<div
		in:fly={{
			delay: 600,
			duration: 300,
			x: 0,
			y: -50,
			easing: expoOut
		}}
		style="cursor: pointer; border: 1px solid #000000; background-color: #9C087E; border-radius: 10px; padding: 5px; height: 50px; width: 50px; margin-left: -20px; margin-top: 5px; z-index: 1;"
	/>
</div>
