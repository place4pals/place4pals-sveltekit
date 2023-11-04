<script>
  import { Auth } from "@aws-amplify/auth";
  import { API } from "@aws-amplify/api";
  import { goto } from "$app/navigation";
  import { store } from "../../store";
  import { compressImage } from "#src/utils";
  import { useQueryClient } from "@tanstack/svelte-query";
  const queryClient = useQueryClient();
</script>

<div style="margin:10px;align-self:flex-start;">
  <label for="files" class="btn">Update profile picture:</label>
  <input
    id="files"
    type="file"
    on:change={async (e) => {
      let mediaKey;
      if (e.target.files[0]) {
        const base64 = await compressImage({
          file: e.target.files[0],
          isProfile: true,
        });
        mediaKey = await API.post("auth", "/uploadImage", { body: { base64 } });
        await API.graphql({
          query: `mutation($id: uuid!, $image: String) { update_users_by_pk(pk_columns: {id: $id}, _set: {image: $image}) { id } }`,
          variables: { id: $store.sub, image: mediaKey },
        });
        await queryClient.refetchQueries({ queryKey: ["user"] });
      }
    }}
  />
</div>
<button
  on:click={async () => {
    await Auth.signOut();
    store.update((obj) => ({ ...obj, sub: false }));
    goto("/");
  }}>Log out</button
>
