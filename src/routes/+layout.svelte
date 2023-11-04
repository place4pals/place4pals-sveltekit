<script>
  import "../app.css";
  import { Amplify } from "@aws-amplify/core";
  import { Auth } from "@aws-amplify/auth";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { page } from "$app/stores";
  import AddPostModal from "../components/AddPostModal.svelte";
  import LoginModal from "../components/LoginModal.svelte";
  import SignupModal from "../components/SignupModal.svelte";
  import ConfirmModal from "../components/ConfirmModal.svelte";
  import { store } from "#src/store";
  import NavigationBar from "../components/NavigationBar.svelte";
  const queryClient = new QueryClient();
  Amplify.configure({
    Auth: {
      userPoolId: import.meta.env.VITE_USERPOOLID,
      userPoolWebClientId: import.meta.env.VITE_USERPOOLWEBCLIENTID,
    },
    API: {
      graphql_endpoint: `${import.meta.env.VITE_GRAPHQL_URL}/v1/graphql`,
      graphql_headers: async () => {
        let Authorization;
        try {
          Authorization = `Bearer ${(await Auth.currentSession())
            ?.getIdToken()
            ?.getJwtToken()}`;
        } catch (err) {}
        return {
          ...(Authorization && { Authorization }),
        };
      },
      endpoints: [
        {
          name: "public",
          endpoint: import.meta.env.VITE_API_URL + "/public",
          custom_header: async () => ({
            Authorization: null,
          }),
        },
        {
          name: "auth",
          endpoint: import.meta.env.VITE_API_URL + "/auth",
          custom_header: async () => ({
            Authorization:
              "Bearer " +
              (await Auth.currentSession()).getIdToken().getJwtToken(),
          }),
        },
      ],
    },
  });
</script>

<svelte:head>
  <title>place4pals</title>
  <meta name="description" content="Non-profit social media" />
</svelte:head>

<QueryClientProvider client={queryClient}>
  <NavigationBar />
  <div class="m-auto min-h-[calc(100vh_-_100px)] max-w-screen-xl">
    <div class="h-[50px]" />
    <slot />
  </div>
  <div class="text-xs text-center text-[#666] my-8">
    {`Copyright © ${new Date().getFullYear()} place4pals inc`}
  </div>
  <AddPostModal bind:showModal={$store.addPostModal} />
  <LoginModal bind:showModal={$store.loginModal} />
  <SignupModal bind:showModal={$store.signupModal} />
  {#if $page.url.searchParams.get("code")}<ConfirmModal showModal={true} />{/if}
</QueryClientProvider>
