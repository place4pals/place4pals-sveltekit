<script>
	import { Auth } from '@aws-amplify/auth';
	import { API } from '@aws-amplify/api';
	import { goto } from '$app/navigation';
	import { userStore } from '../../stores';

	const toBase64 = (file) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
		});
</script>

<div>Welcome, {$userStore.preferred_username}</div>

<div style="margin:10px;align-self:flex-start;">
	<label for="files" class="btn">Update profile picture:</label>
	<input
		id="files"
		type="file"
		on:change={async (e) => {
			let mediaBase64, mediaContentType;
			if (e.target.files[0]) {
				mediaBase64 = await toBase64(e.target.files[0]);
				mediaContentType = e.target.files[0].type;
			}
			await API.put('auth', '/users', { body: { mediaBase64, mediaContentType } });
		}}
	/>
</div>
<button
	on:click={async () => {
		Auth.signOut();
		userStore.set(false);
		goto('/');
	}}>Log out</button
>
