<script>
  import { store } from "#src/store";
  import { sleep } from "#src/utils";
  import Modal from "../components/Modal.svelte";
  import * as Auth from "aws-amplify/auth";
  import { useQueryClient } from "@tanstack/svelte-query";
  const queryClient = useQueryClient();
  export let showModal;
  let terms = false;

  const submit = async () => {
    if (!terms) {
      message = `You must accept the Terms and Privacy Policy`;
      return;
    }
    if (!password?.length) {
      message = `You must enter a password`;
      return;
    }
    if (password?.length < 6) {
      message = "Password must be at least 6 characters long";
      return;
    }
    if (!username?.length) {
      message = `You must enter a username`;
      return;
    }
    if (!email?.length) {
      message = `You must enter a valid email`;
      return;
    }
    loading = true;
    try {
      await Auth.signUp({
        username: crypto.randomUUID(),
        password: password,
        options: {
          userAttributes: {
            "custom:username": username,
            email: email,
          },
          autoSignIn: {
            enabled: true,
          },
        },
      });
      await sleep(1000);
      await Auth.autoSignIn();
      const user = await Auth.getCurrentUser();
      store.update((obj) => ({ ...obj, sub: user.userId }));
      await queryClient.refetchQueries({ queryKey: ["user"] });
      loading = false;
      dialog.close();
    } catch (err) {
      loading = false;
      message = "That email or username is already taken";
    }
  };
  let email;
  let username;
  let password;
  let dialog;
  let loading = false;
  let message = "Create an account";
</script>

<Modal bind:showModal bind:dialog>
  <div class="container">
    <div class="title">{message}</div>
    <form class="form" on:submit={submit}>
      <input
        class="input"
        disabled={loading}
        bind:value={username}
        type="text"
        placeholder="Username"
      />
      <input
        class="input"
        disabled={loading}
        bind:value={email}
        type="email"
        placeholder="Email"
      />
      <input
        class="input"
        disabled={loading}
        bind:value={password}
        type="password"
        placeholder="Password"
      />
      <div class="terms">
        <label for="terms"
          >I agree to the <a href="">Terms</a> and
          <a href="">Privacy Policy</a></label
        >
        <input id="terms" type="checkbox" bind:value={terms} />
      </div>
      <button class="submit" disabled={loading}>Sign up</button>
      <div>
        Already have an account?
        <a
          href="javascript:void(0)"
          on:click={() => {
            dialog.close();
            store.update((obj) => ({
              ...obj,
              signupModal: false,
              loginModal: true,
            }));
          }}>Login here</a
        >.
      </div>
    </form>
  </div>
</Modal>

<style>
  .form {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }
  .container {
    padding: 10px;
  }
  .title {
    margin-bottom: 10px;
  }
  .input,
  .submit {
    padding: 4px 8px;
  }
  .terms {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    justify-content: flex-end;
    gap: 3px;
    font-size: 14px;
  }
</style>
