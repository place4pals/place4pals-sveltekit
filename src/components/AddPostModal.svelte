<script>
	import Modal from '../components/Modal.svelte';
	import { API } from '@aws-amplify/api';
	import { useQueryClient } from '@tanstack/svelte-query';
	const queryClient = useQueryClient();
	export let showModal;
	let dialog;
	let addingPost = false;

	const addPost = async () => {
		addingPost = true;
		let mediaBase64, mediaContentType;
		if (media) {
			mediaBase64 = await toBase64(media);
			mediaContentType = media.type;
		}
		await API.post('auth', '/posts', { body: { title, content, mediaBase64, mediaContentType } });
		await queryClient.refetchQueries({ queryKey: ['posts'] });
		addingPost = false;
		dialog.close();
		title = '';
		content = '';
	};
	const toBase64 = (file) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
		});
	let title;
	let content;
	let media;
</script>

<Modal bind:showModal bind:dialog>
	<div class="container">
		<input
			bind:value={title}
			style="width:calc(100% - 20px);margin-top:3px;padding:10px;"
			placeholder="Title"
		/>
		<textarea
			bind:value={content}
			style="width:calc(100% - 20px);height:200px;margin-top:10px;font-family:arial;padding:10px;resize:none;"
			placeholder="Content"
		/>
		<div style="margin:10px;align-self:flex-start;">
			<label for="files" class="btn">Upload media:</label>
			<input
				id="files"
				type="file"
				style="width:200px;margin-left:10px;"
				on:change={(e) => {
					media = e.target.files[0];
				}}
			/>
		</div>
		<div
			style="display: flex;
        flex-direction: row;
        gap: 10px;
        justify-content: flex-end;
        align-items: center;"
		>
			<a
				href="javascript:void(0)"
				on:click={() => {
					dialog.close();
				}}>Cancel</a
			>
			<button disabled={addingPost} on:click={addPost}>Submit</button>
		</div>
	</div>
</Modal>

<style>
	.container {
		padding: 10px;
	}
</style>
