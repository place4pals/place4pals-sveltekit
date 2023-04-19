<script>
	import { Auth } from '@aws-amplify/auth';
	import { goto } from '$app/navigation';
	let username;
	const async = async () => {
		try {
			username = (await Auth.currentSession()).getIdToken().payload.preferred_username;
		} catch (err) {}
	};
	async();
</script>

<div>Welcome, {username}</div>
<button
	on:click={async () => {
		Auth.signOut();
		goto('/');
	}}>Log out</button
>
