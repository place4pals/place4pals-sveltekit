<script>
	let introModal = false;
	if (typeof localStorage !== 'undefined') {
		introModal = localStorage?.getItem('introModal') ? false : true;
	}
	import { useQueryClient, createQuery } from '@tanstack/svelte-query';
	const queryClient = useQueryClient();
	import Squares from '../components/Squares.svelte';
	const query = createQuery({
		queryKey: ['posts'],
		queryFn: () => fetch(`https://lambda.place4pals.com/public/posts`).then((res) => res.json())
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
		Welcome to <b>place4pals</b>, a 501(c)(3) registered non-profit social media platform.
		<br /><br />
		<a href="javascript:void(0)">Create an account</a> to start adding posts and comments, or simply
		keep lurking below.
	</div>
{/if}
{#if $query.isLoading}
	<div class="loader">
		<div />
		<div />
		<div />
		<div />
	</div>
{:else}
	{#each $query.data as { id, name, date, content, user, comments }}
		<div style="margin-bottom:10px;background-color:#e9f7ff;padding: 10px;border-radius:10px;">
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
				{#each content.split('\n\n') as paragraph}
					<p>{paragraph}</p>
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
			</div>
			{#if showComments[id]}
				<div style="margin-top:10px;">
					{#if comments.length === 0}
						<div>No comments</div>
					{:else}
						{#each comments as comment}
							<div
								title={new Date(date)
									.toLocaleString('en-US', localeStringOptions)
									.split(' at ')
									.map((obj, index) => `${index === 0 ? '🗓️ ' : ', 🕐 '}${obj}`)
									.join('') + ' EST'}
							>
								<a href="/users/{comment.user.id}">{comment.user.name}</a>: {comment.content}
								{#each comment.comments as comment}
									<div
										style="margin-left:20px;margin-top:5px;"
										title={new Date(date)
											.toLocaleString('en-US', localeStringOptions)
											.split(' at ')
											.map((obj, index) => `${index === 0 ? '🗓️ ' : ', 🕐 '}${obj}`)
											.join('') + ' EST'}
									>
										<a href="/users/{comment.user.id}">{comment.user.name}</a>: {comment.content}
									</div>
								{/each}
							</div>
						{/each}
					{/if}
					<input
						style="margin-top:5px;padding:5px;width:calc(100% - 15px);"
						placeholder="Add a comment"
					/>
				</div>
			{/if}
		</div>
	{/each}
{/if}
