<script>
  import { store } from "#src/store";
  import Modal from "../components/Modal.svelte";
  import * as Auth from "aws-amplify/auth";
  import { useQueryClient } from "@tanstack/svelte-query";
  const queryClient = useQueryClient();
  export let showModal;

  const submit = async () => {
    loading = true;
    try {
      await Auth.signIn({ username, password });
      const user = await Auth.getCurrentUser();
      store.update((obj) => ({ ...obj, sub: user.userId }));
      await queryClient.refetchQueries({ queryKey: ["user"] });
      loading = false;
      dialog.close();
    } catch (err) {
      console.log(err);
      loading = false;
      message = "Your username or password is incorrect";
    }
  };
  let username;
  let password;
  let dialog;
  let loading = false;
  let message = "Welcome back, pal!";
</script>

<Modal bind:showModal bind:dialog>
  <div>
    <div>{message}</div>
    <form on:submit={submit}>
      <input
        disabled={loading}
        bind:value={username}
        type="text"
        placeholder="Username or email"
      />
      <input
        disabled={loading}
        bind:value={password}
        type="password"
        placeholder="Password"
      />
      <button disabled={loading} style="padding:4p">Login</button>
      <div>
        Don't have an account?
        <a
          href="javascript:void(0)"
          on:click={() => {
            dialog.close();
            store.update((obj) => ({
              ...obj,
              signupModal: true,
              loginModal: false,
            }));
          }}>Sign up here</a
        >.
      </div>
      <div>
        Forget your password?
        <a
          href="javascript:void(0)"
          on:click={() => {
            dialog.close();
            store.update((obj) => ({
              ...obj,
              resetModal: true,
              loginModal: false,
            }));
          }}>Reset it here</a
        >.
      </div>
    </form>
  </div>
</Modal>
