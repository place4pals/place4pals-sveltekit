<script>
	import { useQueryClient, createQuery } from '@tanstack/svelte-query';
	const queryClient = useQueryClient();
	import Squares from '../components/Squares.svelte';
	import Loader from '../components/Loader.svelte';
	import { API } from '@aws-amplify/api';
	import { userStore, modalStore, introStore } from '../stores';
	import DeletingLoader from '../components/DeletingLoader.svelte';
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
	let postedTyping = false;
	let addingComment = false;
	let deletingId = null;
</script>

{#if $introStore}
	<div
		style="margin-bottom:10px;background-color:#eee;padding: 10px;border-radius:10px;position:relative;"
	>
		<div style="float:right;margin-right:20px;transform:scale(0.75);margin-top:-13px;">
			<Squares />
		</div>
		<a
			on:click={() => {
				introStore.set(0);
			}}
			style="text-decoration-line:none;position:absolute;right:5px;height:30px;width:30px;display:flex;justify-content:center;align-items:center;"
			href="javascript:void(0)">×</a
		>
		<div>
			Welcome to <b>place4pals</b>, a 501(c)(3) registered non-profit social media platform.
			<br /><br />
			<a
				href="javascript:void(0)"
				on:click={() => {
					modalStore.update((obj) => ({ ...obj, signupModal: true }));
				}}>Sign up</a
			>
			to start adding posts and comments,
			<a
				href="javascript:void(0)"
				on:click={() => {
					modalStore.update((obj) => ({ ...obj, loginModal: true }));
				}}>login</a
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
			style="margin-bottom:10px;background-color:#e9f7ff;padding: 10px;border-radius:10px;position:relative;"
		>
			{#if user.id === $userStore.profile}
				<div
					style="text-decoration-line:none;position:absolute;right:5px;height:30px;width:30px;display:flex;justify-content:center;align-items:center;"
				>
					{#if deletingId === id}
						<DeletingLoader />
					{:else}
						<a
							on:click={async () => {
								const confirm = window.confirm(`Are you sure you want to delete "${name}"?`);
								if (confirm) {
									deletingId = id;
									await API.del('auth', '/posts', { body: { id } });
									queryClient.refetchQueries({ queryKey: ['posts'] });
								}
							}}
							href="javascript:void(0)">×</a
						>
					{/if}
				</div>
			{/if}
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
					<img class="postImage" src="https://files.place4pals.com/public/{media}" />
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
								{#if comment.user.id === $userStore.profile}
									{#if deletingId === comment.id}
										<DeletingLoader />
									{:else}
										<a
											on:click={async () => {
												deletingId = comment.id;
												await API.del('auth', '/comments', {
													body: { postId: id, commentId: comment.id }
												});
												queryClient.refetchQueries({ queryKey: ['posts'] });
											}}
											style="display: inline-block;"
											href="javascript:void(0)">×</a
										>
									{/if}
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
							if ($userStore) {
								addingComment = true;
								const formData = new FormData(e.target);
								await API.post('auth', '/comments', {
									body: { postId: id, content: formData.get('comment')?.toString() }
								});
								await queryClient.refetchQueries({ queryKey: ['posts'] });
								e.target.reset();
								addingComment = false;
							} else {
								modalStore.update((obj) => ({ ...obj, signupModal: true }));
							}
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
							disabled={addingComment}
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
