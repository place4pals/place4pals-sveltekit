<script>
	import Modal from '../components/Modal.svelte';
	import { Auth } from '@aws-amplify/auth';
	export let showModal;

	const submit = async () => {
		loading = true;
		try {
			await Auth.signIn(username, password);
			loading = false;
			dialog.close();
		} catch (err) {
			loading = false;
			message = 'Your username or password is incorrect';
		}
	};
	let username;
	let password;
	let dialog;
	let loading = false;
	let message = 'Welcome back, pal';
</script>

<Modal bind:showModal bind:dialog>
	<div class="container">
		<div class="title">{message}</div>
		<form class="form" on:submit={submit}>
			<input
				class="input"
				disabled={loading}
				bind:value={username}
				type="text"
				placeholder="Username or email"
			/>
			<input
				class="input"
				disabled={loading}
				bind:value={password}
				type="password"
				placeholder="Password"
			/>
			<button class="close" disabled={loading} style="padding:4p">Login</button>
		</form>
	</div>
</Modal>

<style>
	.form {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: 10px;
	}
	.container {
		padding: 10px;
	}
	.title {
		margin-bottom: 10px;
	}
	.input,
	.close {
		padding: 4px 8px;
	}
</style>
