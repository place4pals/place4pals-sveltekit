<script>
	import Modal from '../components/Modal.svelte';
	import { Auth } from '@aws-amplify/auth';
	import { page } from '$app/stores';
	import Loader from './Loader.svelte';
	export let showModal;
	let dialog;
	let loading = true;
	let success = false;

	const confirm = async () => {
		const username = $page.url.searchParams.get('username');
		const code = $page.url.searchParams.get('code');
		try {
			const user = await Auth.confirmSignUp(username, code);
			console.log(user);
			success = true;
			$page.url.searchParams.delete('username');
			$page.url.searchParams.delete('code');
			localStorage?.setItem('introModal', '1');
			loading = false;
		} catch (err) {
			loading = false;
		}
	};
	confirm();
</script>

<Modal bind:showModal bind:dialog>
	<div class="container">
		{#if loading}
			<Loader />
		{:else if success}
			<div class="title">Success! Your account is confirmed.</div>
			<button
				on:click={() => {
					dialog.close();
				}}
				disabled={loading}
				style="padding:4p">Start browsing</button
			>
		{:else}
			<div class="title">Sorry, there an issue confirming your account.</div>
			<button
				class="close"
				on:click={() => {
					dialog.close();
				}}
				disabled={loading}
				style="padding:4p">Close</button
			>
		{/if}
	</div>
</Modal>

<style>
	.container {
		padding: 10px;
		height: 175px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.title {
		margin-bottom: 10px;
	}
	.close {
		padding: 4px 8px;
	}
</style>
