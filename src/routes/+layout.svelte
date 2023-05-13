<script>
	import { Environment } from './Environment';
	import { Amplify } from '@aws-amplify/core';
	import { Auth } from '@aws-amplify/auth';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { page } from '$app/stores';
	import './styles.css';
	import AddPostModal from '../components/AddPostModal.svelte';
	import LoginModal from '../components/LoginModal.svelte';
	import SignupModal from '../components/SignupModal.svelte';
	import ConfirmModal from '../components/ConfirmModal.svelte';
	import { userStore, modalStore } from '../stores.js';
	import InnerLoader from '../components/InnerLoader.svelte';
	Amplify.configure({
		Auth: {
			identityPoolId: Environment.identityPoolId,
			region: Environment.region,
			identityPoolRegion: Environment.region,
			userPoolId: Environment.userPoolId,
			userPoolWebClientId: Environment.userPoolWebClientId,
			mandatorySignIn: true,
			authenticationFlowType: 'USER_PASSWORD_AUTH',
			signUpVerificationMethod: 'link'
		},
		API: {
			endpoints: [
				{
					name: 'public',
					endpoint: Environment.endpoint + '/public',
					region: Environment.region,
					custom_header: async () => ({
						Authorization: null
					})
				},
				{
					name: 'auth',
					endpoint: Environment.endpoint + '/auth',
					region: Environment.region,
					custom_header: async () => ({
						Authorization: 'Bearer ' + (await Auth.currentSession()).getIdToken().getJwtToken()
					})
				}
			]
		},
		Storage: {
			AWSS3: {
				bucket: Environment.bucket,
				region: Environment.region
			}
		},
		Analytics: {
			disabled: true
		}
	});

	const queryClient = new QueryClient();

	const async = async () => {
		try {
			const user = (await Auth.currentSession()).getIdToken().payload;
			userStore.set(user);
		} catch (err) {
			userStore.set(false);
		}
	};
	async();
</script>

<svelte:head>
	<title>place4pals</title>
	<meta name="description" content="non-profit social media" />
</svelte:head>

<QueryClientProvider client={queryClient}>
	<div style="min-height:calc(100vh - 40px);">
		<div
			style="display:flex;flex-direction:row;padding:10px;align-items:center;position:fixed;background-color:#ffffff66;width:100%;z-index:100;backdrop-filter: blur(10px);-webkit-backdrop-filter:blur(10px);max-width:1280px;"
		>
			<a
				href="/"
				style="display:flex;flex-direction:row;justify-content:center;align-items:center;text-decoration-line:none;font-size:24px;color:#000;margin-right:10px;"
			>
				<img alt="" style="height:30px;width:30px;margin-right:5px;" src="/favicon.png" /><span
					class="desktop">place4pals</span
				>
			</a>
			<a class="navLink {$page.url.pathname === '/' ? 'active' : ''}" href="/">= Feed</a>
			<a class="navLink {$page.url.pathname.startsWith('/pools') ? 'active' : ''}" href="pools"
				>≈ Pools</a
			>
			<a class="navLink {$page.url.pathname.startsWith('/chat') ? 'active' : ''}" href="chat"
				>⇆ Chat</a
			>
			<button
				class={$userStore ? '' : 'desktop'}
				style="margin:0px 10px;"
				on:click={() => {
					if ($userStore) {
						modalStore.update((obj) => ({ ...obj, addPostModal: true }));
					} else {
						modalStore.update((obj) => ({ ...obj, signupModal: true }));
					}
				}}>+ Post</button
			>
			<div
				style="margin-left:auto;margin-right:30px;display:flex;flex-direction:row;justify-content:center;align-items:center;gap:5px"
			>
				<div>
					<label for="sort" class="btn">Theme:</label>
					<select style="margin-right:10px;width:80px;">
						{#each ['Light', 'Dark', 'Blue'] as obj}
							<option value={obj}>{obj}</option>
						{/each}
					</select>
				</div>
				{#if $userStore === null}
					<InnerLoader />
				{:else if $userStore === false}
					<a
						href="javascript:void(0)"
						on:click={() => {
							modalStore.update((obj) => ({ ...obj, signupModal: true }));
						}}>Sign up</a
					>
					or
					<a
						href="javascript:void(0)"
						on:click={() => {
							modalStore.update((obj) => ({ ...obj, loginModal: true }));
						}}>Log in</a
					>
				{:else if $userStore}
					<a
						class="navLink {$page.url.pathname.startsWith('/notifications') ? 'active' : ''}"
						href="notifications">⩍ (0)</a
					>
					<a
						class="navLink {$page.url.pathname.startsWith('/profile') ? 'active' : ''}"
						style="display:flex;flex-direction:row;align-items:center;gap:5px;margin-right:-10px;"
						href="profile"
						><img
							alt=""
							style="height:25px;width:25px;border:1px solid #000;border-radius:8px"
							src="https://files.place4pals.com/public/{$userStore.picture}"
						/>
						<div
							style="width:10px;height:10px;background-color:green;border-radius:100%;margin-left:-12px;margin-bottom:-22px;border:1px solid #000"
						/>
						<span class="desktop">{$userStore.preferred_username}</span></a
					>
				{/if}
			</div>
		</div>
		<div style="height:40px;" />
		<div style="padding:10px;">
			<slot />
		</div>
	</div>

	<div style="text-align:center;font-size:12px;color:#aaa;margin-top:auto;margin-bottom:20px;">
		Copyright © {new Date().getFullYear()} place4pals inc
	</div>
	<AddPostModal bind:showModal={$modalStore.addPostModal} />
	<LoginModal bind:showModal={$modalStore.loginModal} />
	<SignupModal bind:showModal={$modalStore.signupModal} />
	{#if $page.url.searchParams.get('code')}
		<ConfirmModal showModal={true} />
	{/if}
</QueryClientProvider>
