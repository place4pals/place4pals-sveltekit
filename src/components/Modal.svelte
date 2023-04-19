<script>
	export let showModal; // boolean

	export let dialog; // HTMLDialogElement

	$: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<div on:click|stopPropagation>
		<a
			on:click={() => {
				dialog.close();
			}}
			class="exit"
			href="javascript:void(0)">×</a
		>
		<slot />
	</div>
</dialog>

<style>
	dialog {
		width: 400px;
		border: 1px solid black;
		border-radius: 10px;
		padding: 10px;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 20px;
	}
	.exit {
		text-decoration-line: none;
		position: absolute;
		right: 5px;
		top: 10px;
		height: 30px;
		width: 30px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
