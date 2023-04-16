<script>
	import './styles.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { clickOutside } from '../scripts/clickOutside.js';
	const queryClient = new QueryClient();
	let addPostModal = false;
	let title = '';
	let content = '';
	const addPost = async () => {
		await fetch('https://lambda.place4pals.com/public/posts', {
			method: 'POST',
			body: JSON.stringify({ title, content })
		});
		queryClient.refetchQueries({ queryKey: ['posts'] });
		addPostModal = false;
		title = '';
		content = '';
	};
</script>

<QueryClientProvider client={queryClient}>
	<div style="min-height:calc(100vh - 40px);">
		<div
			style="display:flex;flex-direction:row;padding:10px;align-items:center;position:fixed;background-color:#ffffffee;width:100%;z-index:100;"
		>
			<a
				href="/"
				style="display:flex;flex-direction:row;justify-content:center;align-items:center;text-decoration-line:none;font-size:24px;color:#000;margin-right:10px;"
			>
				<img alt="" style="height:30px;width:30px;margin-right:5px;" src="/favicon.png" />place4pals
			</a>
			<a style="margin:0px 10px;" href="/">= Feed</a>
			<a style="margin:0px 10px;" href="pools">≈ Pools</a>
			<a style="margin:0px 10px;" href="chat">⇆ Chat</a>
			<a style="margin:0px 10px;" href="profile">▢ Profile</a>
			<button
				style="margin:0px 10px;"
				on:click={() => {
					addPostModal = !addPostModal;
				}}>+ Add post</button
			>
			<input style="width:300px;" placeholder="🔍 Search" />
		</div>
		{#if addPostModal}
			<div
				style="
				position: fixed;
				left: 215px;
				background-color: rgb(255, 255, 255);
				padding: 10px;
				border: 1px solid rgb(204, 204, 204);
				border-radius: 10px;
				display: flex;
				flex-direction: column;
				justify-content: flex-start;
				align-items: center;
				width: 600px;
				height: 500px;
				top: 50px;
				z-index: 100;
				"
				use:clickOutside
				on:click_outside={() => {
					addPostModal = false;
				}}
			>
				<div
					style="height: 15px;
				width: 15px;
				border-top: 1px solid #ccc;
				border-right: 1px solid #ccc;
				transform: rotate(-45deg);
				margin-top: -19px;
				background-color: #fff;"
				/>
				<input
					bind:value={title}
					style="width:calc(100% - 20px);margin-top:3px;padding:10px;"
					placeholder="Title"
				/>
				<textarea
					bind:value={content}
					style="width:calc(100% - 20px);height:400px;margin-top:10px;font-family:arial;padding:10px;"
					placeholder="Content"
				/>
				<div style="margin:10px;align-self:flex-start;">
					<label for="files" class="btn">Upload media:</label>
					<input id="files" type="file" />
				</div>
				<div style="display:flex;flex-direction:row;gap:10px;align-self:flex-end;">
					<a href="javascript:void(0)" on:click={(addPostModal = false)}>Cancel</a>
					<button on:click={addPost}>Submit</button>
				</div>
			</div>
		{/if}
		<div style="height:40px;" />
		<div style="padding:10px;">
			<slot />
		</div>
	</div>

	<div style="text-align:center;font-size:12px;color:#aaa;margin-top:auto;margin-bottom:20px;">
		Copyright © {new Date().getFullYear()} place4pals inc
	</div>
</QueryClientProvider>

<style>
</style>
