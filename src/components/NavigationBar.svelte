<script>
  import * as Auth from "aws-amplify/auth";
  import { QueryClient, createQuery } from "@tanstack/svelte-query";
  import { page } from "$app/stores";
  import { store } from "#src/store";
  import InnerLoader from "../components/InnerLoader.svelte";
  import * as API from "aws-amplify/api";
  const apiClient = API.generateClient();

  const async = async () => {
    if ($store.dark) {
      document.documentElement.classList.add("dark");
    }
    const userSub = (await Auth.fetchAuthSession()).tokens?.idToken?.payload
      ?.sub;
    store.update((obj) => ({ ...obj, sub: userSub ?? false }));
  };
  async();

  const toggleDarkMode = () => {
    if (!document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.add("dark");
      store.update((obj) => ({ ...obj, dark: true }));
    } else {
      document.documentElement.classList.remove("dark");
      store.update((obj) => ({ ...obj, dark: false }));
    }
  };

  const user = createQuery({
    queryKey: ["user"],
    queryFn: async () =>
      (
        await apiClient.graphql({
          query: `query($id: uuid!) { users_by_pk(id: $id) { id name image }} `,
          variables: {
            id: (await Auth.fetchAuthSession()).tokens?.idToken?.payload.sub,
          },
        })
      ).data.users_by_pk,
  });
</script>

<div
  class="fixed z-10 bg-background flex flex-row items-center w-full justify-between gap-4 py-2"
>
  <div
    class="m-auto w-full max-w-screen-xl flex flex-row items-center justify-between px-2"
  >
    <div class="flex flex-row items-center gap-4">
      <a class="flex flex-row gap-1 items-center text-xl text-text" href="/">
        <img alt="logo" class="h-[30px] w-[30px]" src="/favicon.png" />
        <div class="hidden sm:flex">place4pals</div>
      </a>
      <a
        class="text-subtitle hover:opacity-50 {$page.url.pathname === '/'
          ? 'underline text-text'
          : ''}"
        href="/">= Feed</a
      >
      <a
        class="text-subtitle hover:opacity-50 {$page.url.pathname.startsWith(
          '/pools'
        )
          ? 'underline text-text'
          : ''}"
        href="pools">≈ Pools</a
      >
      <a
        class="text-subtitle {$page.url.pathname.startsWith('/chat')
          ? 'underline text-text'
          : ''}"
        href="chat">⇆ Chat</a
      >
      <button
        on:click={() => {
          if ($store) {
            store.update((obj) => ({ ...obj, addPostModal: true }));
          } else {
            store.update((obj) => ({ ...obj, signupModal: true }));
          }
        }}>+ Post</button
      >
    </div>
    <div class="flex flex-row items-center gap-4">
      <button class="hidden sm:flex p-0 border-0" on:click={toggleDarkMode}>
        {#if $store.dark}
          <img
            title="Turn on the lights"
            alt="off"
            class="h-8 rounded-[3px] hover:opacity-80"
            src="/off.png"
          />
        {:else}
          <img
            title="Turn off the lights"
            alt="on"
            class="h-8 rounded-[3px] hover:opacity-80"
            src="/on.png"
          />{/if}
      </button>
      {#if $store.sub === null}
        <InnerLoader />
      {:else if $store.sub === false}
        <div class="hidden sm:flex gap-[5px]">
          <a
            href="javascript:void(0)"
            on:click={() => {
              store.update((obj) => ({ ...obj, signupModal: true }));
            }}>Sign up</a
          >
          or
          <a
            href="javascript:void(0)"
            on:click={() => {
              store.update((obj) => ({ ...obj, loginModal: true }));
            }}>Log in</a
          >
        </div>
        <div class="flex sm:hidden">
          <a
            class="text-xs"
            href="javascript:void(0)"
            on:click={() => {
              store.update((obj) => ({ ...obj, signupModal: true }));
            }}>Sign up</a
          >
        </div>
      {:else if $user?.data?.id}
        <!-- <a
          class="text-subtitle hover:opacity-50 {$page.url.pathname.startsWith(
            '/notifications'
          )
            ? 'underline text-text'
            : ''}"
          href="/notifications">⩍ (0)</a
        > -->
        <a
          class="relative flex flex-row gap-1 text-subtitle hover:opacity-50 {$page.url.pathname.startsWith(
            '/profile'
          )
            ? 'underline text-text'
            : ''}"
          href="/profile"
        >
          <img
            alt=""
            class="h-[25px] w-[25px] rounded-md border-[1px] border-text"
            src={`https://files.place4pals.com/${
              $user?.data?.image ?? "profile.jpg"
            }`}
          />
          <div
            class="absolute left-[20px] top-[18px] bg-[green] rounded-full h-[8px] w-[8px] border-[1px] border-text"
          />
          <div class="hidden sm:flex">{$user?.data?.name}</div></a
        >
      {/if}
    </div>
  </div>
</div>
