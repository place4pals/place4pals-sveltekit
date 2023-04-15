<script>
	import { createQuery } from '@tanstack/svelte-query';
	const query = createQuery({
		queryKey: ['posts'],
		queryFn: () => fetch(`https://api-ddb.place4pals.com/posts`).then((res) => res.json())
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

<div style="display:flex;flex-direction:row;margin:10px;align-items:center;">
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
	<button style="margin:0px 10px;">+ Add post</button>
	<input style="width:300px;" placeholder="🔍 Search" />
</div>

{#if $query.isLoading}
	<div style="margin:10px;">...</div>
{:else}
	{#each $query.data as { id, name, date, content, user, comments }}
		<div style="margin-bottom:10px;background-color:#e9f7ff;padding: 10px;border-radius:10px;">
			<div style="font-size:12px;">
				<a style="font-size:20px;" href="/post/{id}">{name}</a> by
				<a href="/user/{user.id}">{user.name}</a>
			</div>
			<div style="font-size:12px;color:#666;">
				{new Date(date)
					.toLocaleString('en-US', localeStringOptions)
					.split(' at ')
					.map((obj, index) => `${index === 0 ? '🗓️ ' : ', 🕐 '}${obj}`)
					.join('') + ' EST'}
			</div>
			<div style="margin: 10px 0px;">{content}</div>
			<div>
				<a
					href=""
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
								<a href="user/{comment.user.id}">{comment.user.name}</a>: {comment.content}
								{#each comment.comments as comment}
									<div
										style="margin-left:20px;"
										title={new Date(date)
											.toLocaleString('en-US', localeStringOptions)
											.split(' at ')
											.map((obj, index) => `${index === 0 ? '🗓️ ' : ', 🕐 '}${obj}`)
											.join('') + ' EST'}
									>
										<a href="user/{comment.user.id}">{comment.user.name}</a>: {comment.content}
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

<style>
</style>
