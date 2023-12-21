<script>
  import "../app.css";
  import { Amplify } from "aws-amplify";
  import * as Auth from "aws-amplify/auth";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { page } from "$app/stores";
  import AddPostModal from "../components/AddPostModal.svelte";
  import LoginModal from "../components/LoginModal.svelte";
  import SignupModal from "../components/SignupModal.svelte";
  import ConfirmModal from "../components/ConfirmModal.svelte";
  import { store } from "#src/store";
  import NavigationBar from "../components/NavigationBar.svelte";
  const queryClient = new QueryClient();
  Amplify.configure(
    {
      Auth: {
        Cognito: {
          userPoolId: import.meta.env.VITE_USERPOOLID,
          userPoolClientId: import.meta.env.VITE_USERPOOLWEBCLIENTID,
        },
      },
      API: {
        GraphQL: {
          endpoint: `${import.meta.env.VITE_GRAPHQL_URL}/v1/graphql`,
          defaultAuthMode: "none",
        },
        REST: {
          public: {
            endpoint: `${import.meta.env.VITE_API_URL}/public`,
          },
          auth: {
            endpoint: `${import.meta.env.VITE_API_URL}/auth`,
          },
        },
      },
    },
    {
      API: {
        GraphQL: {
          headers: async () => {
            const jwtToken = (
              await Auth.fetchAuthSession()
            ).tokens?.idToken?.toString();
            return {
              ...(jwtToken && {
                Authorization: `Bearer ${jwtToken}`,
              }),
            };
          },
        },
        REST: {
          headers: async ({ apiName }) =>
            apiName === "auth"
              ? {
                  Authorization: `Bearer ${(
                    await Auth.fetchAuthSession()
                  ).tokens?.idToken?.toString()}`,
                }
              : { "X-Api-Key": "1" },
        },
      },
    }
  );
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
