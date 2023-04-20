<script>
	import { modalStore } from '../stores';
	import Modal from '../components/Modal.svelte';
	import { Auth } from '@aws-amplify/auth';
	export let showModal;
	let checkEmail = false;

	const submit = async () => {
		if (password.length < 6) {
			message = 'Password must be at least 6 characters long';
		}
		loading = true;
		try {
			await Auth.signUp({
				username: crypto.randomUUID(),
				password: password,
				attributes: {
					'custom:username': username,
					email: email,
					'custom:userType': 'user'
				},
				autoSignIn: {
					enabled: true
				}
			});
			loading = false;
			checkEmail = true;
		} catch (err) {
			loading = false;
			message = 'That username is already taken';
		}
	};
	let email;
	let username;
	let password;
	let dialog;
	let loading = false;
	let message = 'Create an account';
</script>

<Modal bind:showModal bind:dialog>
	<div class="container">
		{#if checkEmail}
			<div class="title">
				Success! Please check your email- you must confirm your email address before logging in.
			</div>
			<button
				on:click={() => {
					dialog.close();
				}}>Close</button
			>
		{:else}
			<div class="title">{message}</div>
			<form class="form" on:submit={submit}>
				<input
					class="input"
					disabled={loading}
					bind:value={username}
					type="text"
					placeholder="Username"
				/>
				<input
					class="input"
					disabled={loading}
					bind:value={email}
					type="email"
					placeholder="Email"
				/>
				<input
					class="input"
					disabled={loading}
					bind:value={password}
					type="password"
					placeholder="Password"
				/>
				<div class="terms">
					<label for="terms"
						>I agree to the <a href="">Terms</a> and <a href="">Privacy Policy</a></label
					>
					<input id="terms" type="checkbox" />
				</div>
				<button class="submit" disabled={loading}>Sign up</button>
				<div>
					Already have an account?
					<a
						href="javascript:void(0)"
						on:click={() => {
							dialog.close();
							modalStore.update((obj) => ({ ...obj, signupModal: false, loginModal: true }));
						}}>Login here</a
					>.
				</div>
			</form>
		{/if}
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
	.submit {
		padding: 4px 8px;
	}
	.terms {
		display: flex;
		flex-direction: row-reverse;
		align-items: center;
		justify-content: flex-end;
		gap: 3px;
		font-size: 14px;
	}
</style>
