<script>
	import { page } from '$app/stores';
	let introModal = false;
	if (typeof localStorage !== 'undefined') {
		introModal = localStorage?.getItem('introModal')
			? false
			: localStorage?.getItem('amplify-signin-with-hostedUI')
			? false
			: true;
	}
	import { useQueryClient, createQuery } from '@tanstack/svelte-query';
	const queryClient = useQueryClient();
	import Squares from '../components/Squares.svelte';
	import LoginModal from '../components/LoginModal.svelte';
	import SignupModal from '../components/SignupModal.svelte';
	import ConfirmModal from '../components/ConfirmModal.svelte';
	import Loader from '../components/Loader.svelte';
	import { API } from '@aws-amplify/api';
	import { Auth } from '@aws-amplify/auth';
	const query = createQuery({
		queryKey: ['posts'],
		queryFn: () => API.get('public', '/posts', {})
	});
	const showComments = {};
	const localeStringOptions = {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		hour12: true
	};
	let loginModal = false;
	let signupModal = false;
	let confirmModal = $page.url.searchParams.get('code') ? true : false;
	let userId, username;
	const async = async () => {
		try {
			const user = (await Auth.currentSession()).getIdToken().payload;
			userId = user.profile;
			username = user.preferred_username;
		} catch (err) {}
	};
	async();
	let postedTyping = false;
	let stopTypingTimeout;
	let focusedPostInterval;
</script>

<svelte:head>
	<title>place4pals</title>
	<meta name="description" content="non-profit social media" />
</svelte:head>

{#if introModal}
	<div style="margin-bottom:10px;background-color:#eee;padding: 10px;border-radius:10px;">
		<div style="float:right;margin-right:20px;transform:scale(0.75);margin-top:-13px;">
			<Squares />
		</div>
		<a
			on:click={() => {
				introModal = false;
				localStorage.setItem('introModal', '1');
			}}
			style="text-decoration-line:none;position:absolute;right:20px;height:30px;width:30px;display:flex;justify-content:center;align-items:center;"
			href="javascript:void(0)">×</a
		>
		<div>
			Welcome to <b>place4pals</b>, a 501(c)(3) registered non-profit social media platform.
			<br /><br />
			<a href="javascript:void(0)" on:click={() => (signupModal = true)}>Create an account</a> to
			start adding posts and comments,
			<a
				href="javascript:void(0)"
				on:click={() => {
					loginModal = true;
				}}>sign in</a
			> if you already have an account, or simply keep lurking below.
		</div>
	</div>
{/if}
<div
	style="margin-bottom:10px;background-color:#eee;padding: 10px;border-radius:10px;display:flex;flex-direction:row;gap:10px;"
>
	<div>
		<label for="sort" class="btn">Sort by:</label>
		<select id="sort">
			{#each ['Newest', 'Highest rating', 'Oldest', 'Lowest rating'] as obj}
				<option value={obj}>{obj}</option>
			{/each}
		</select>
	</div>
	<div>
		<label for="sort" class="btn">Date range:</label>
		<select id="sort">
			{#each ['All time', 'Last hour', 'Last day', 'Last week', 'Last month', 'Last year'] as obj}
				<option value={obj}>{obj}</option>
			{/each}
		</select>
	</div>
</div>
{#if $query.isLoading}
	<Loader />
{:else}
	{#each $query.data as { id, name, date, content, user, comments, typing, media }}
		<div
			on:mouseleave={() => clearInterval(focusedPostInterval)}
			on:mouseenter={async () => {
				// clearInterval(focusedPostInterval);
				// focusedPostInterval = setInterval(async () => {
				// 	const focusedPost = await queryClient.fetchQuery({
				// 		queryKey: [id],
				// 		queryFn: () => API.get('auth', '/posts', { queryStringParameters: { id } })
				// 	});
				// 	queryClient.setQueryData(['posts'], () =>
				// 		$query.data.map((obj) => {
				// 			if (obj.id === id) {
				// 				return focusedPost[0];
				// 			} else {
				// 				return obj;
				// 			}
				// 		})
				// 	);
				// }, 500);
			}}
			style="margin-bottom:10px;background-color:#e9f7ff;padding: 10px;border-radius:10px;"
		>
			<a
				on:click={async () => {
					const confirm = window.confirm(`Are you sure you want to delete "${name}"?`);
					if (confirm) {
						await fetch(`https://lambda.place4pals.com/public/posts`, {
							method: 'DELETE',
							body: JSON.stringify({ id })
						});
						queryClient.refetchQueries({ queryKey: ['posts'] });
					}
				}}
				style="text-decoration-line:none;position:absolute;right:20px;height:30px;width:30px;display:flex;justify-content:center;align-items:center;"
				href="javascript:void(0)">×</a
			>
			<img
				alt=""
				src={user.media
					? `https://files.place4pals.com/public/${user.media}`
					: 'https://staging.place4pals.com/blank.jpg'}
				style="height:38px;width:38px;float:left;border:1px solid #666;border-radius:10px;margin-right:5px;background-color:#fff;"
			/>
			<div style="font-size:12px;">
				<a style="font-size:20px;" href="/posts/{id}">{name}</a> by
				<a href="/users/{user.id}">{user.name}</a>
			</div>
			<div style="font-size:12px;color:#666;">
				{new Date(date)
					.toLocaleString('en-US', localeStringOptions)
					.split(' at ')
					.map((obj, index) => `${index === 0 ? '🗓️ ' : ', 🕐 '}${obj}`)
					.join('') + ' EST'}
			</div>
			<div style="margin: 10px 0px;">
				{#if media}
					<img style="max-width:500px;" src="https://files.place4pals.com/public/{media}" />
				{/if}
				{#each content.split('\n\n') as paragraph}
					<p>
						{#each paragraph.split('\n') as linebreak}
							{linebreak}<br />
						{/each}
					</p>
				{/each}
			</div>
			<div>
				<a
					href="javascript:void(0)"
					on:click={() => {
						showComments[id] = !showComments[id];
					}}
					>{comments.length} comment{comments.length !== 1 ? 's' : ''} [{!showComments[id]
						? '+'
						: '-'}]</a
				>
				<span style="margin:0px 5px;">•</span> Rating: ☆☆☆☆☆
			</div>
			{#if showComments[id]}
				<div style="margin-top:10px;">
					{#if comments.length === 0}
						<div>No comments</div>
					{:else}
						{#each comments as comment}
							<div
								style="margin-bottom:5px;"
								title={new Date(date)
									.toLocaleString('en-US', localeStringOptions)
									.split(' at ')
									.map((obj, index) => `${index === 0 ? '🗓️ ' : ', 🕐 '}${obj}`)
									.join('') + ' EST'}
							>
								<a style="font-weight:bold" href="/users/{comment.user.id}">{comment.user.name}</a>: {comment.content}
								{#if comment.user.id === userId}
									<a
										on:click={async () => {
											await API.del('auth', '/comments', {
												body: { postId: id, commentId: comment.id }
											});
											queryClient.refetchQueries({ queryKey: ['posts'] });
										}}
										style="display: inline-block;"
										href="javascript:void(0)">×</a
									>
								{/if}
								{#each comment.comments as comment}
									<div
										style="margin-left:20px;margin-top:5px;"
										title={new Date(date)
											.toLocaleString('en-US', localeStringOptions)
											.split(' at ')
											.map((obj, index) => `${index === 0 ? '🗓️ ' : ', 🕐 '}${obj}`)
											.join('') + ' EST'}
									>
										<a style="font-weight:bold" href="/users/{comment.user.id}"
											>{comment.user.name}</a
										>: {comment.content}
									</div>
								{/each}
							</div>
						{/each}
					{/if}
					{#if typing?.filter((obj) => obj !== username)?.length}
						<div style="margin-bottom:5px;color:#666;">
							{typing.filter((obj) => obj !== username).join(',')}
							{typing.length === 1 ? 'is' : 'are'} typing...
						</div>
					{/if}
					<form
						on:submit={async (e) => {
							e.preventDefault();
							const formData = new FormData(e.target);
							await API.post('auth', '/comments', {
								body: { postId: id, content: formData.get('comment')?.toString() }
							});
							queryClient.refetchQueries({ queryKey: ['posts'] });
							e.target.reset();
						}}
					>
						<input
							on:keydown={async () => {
								clearTimeout(stopTypingTimeout);
								stopTypingTimeout = setTimeout(async () => {
									await API.del('auth', '/typing', { body: { postId: id } });
								}, 500);

								if (!postedTyping) {
									postedTyping = true;
									await API.post('auth', '/typing', { body: { postId: id } });
									setTimeout(() => {
										postedTyping = false;
									}, 500);
								}
							}}
							name="comment"
							style="padding:5px;width:calc(100% - 15px);"
							placeholder="Add a comment"
						/>
					</form>
				</div>
			{/if}
		</div>
	{/each}
{/if}
<LoginModal bind:showModal={loginModal} />
<SignupModal bind:showModal={signupModal} />
<ConfirmModal bind:showModal={confirmModal} />
