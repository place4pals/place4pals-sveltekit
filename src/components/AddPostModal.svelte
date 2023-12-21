<script>
  import { compressImage } from "#src/utils";
  import Modal from "../components/Modal.svelte";
  import * as API from "aws-amplify/api";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  const queryClient = useQueryClient();
  const apiClient = API.generateClient();
  export let showModal;
  let dialog;
  let addingPost = false;

  const addPost = async () => {
    addingPost = true;
    let mediaKey;
    if (media) {
      const base64 = await compressImage({ file: media });
      mediaKey = await (
        await API.post({
          apiName: "auth",
          path: "/uploadImage",
          options: { body: { base64 } },
        }).response
      ).body.json();
    }
    await apiClient.graphql({
      query: `mutation($name: String, $content: String, $media: String, $pool_id: String) { insert_posts(objects: {name: $name, content: $content, media: $media, pool_id: $pool_id}) {affected_rows}}`,
      variables: { name, content, media: mediaKey, pool_id: pool },
    });
    await queryClient.refetchQueries({ queryKey: ["posts"] });

    addingPost = false;
    dialog.close();
    name = "";
    content = "";
  };
  let name;
  let content;
  let media;
  let pool = "general";
  const query = createQuery({
    queryKey: ["pools"],
    queryFn: async () =>
      (
        await apiClient.graphql({
          query: `{pools(order_by: {order: asc}){ id name }}`,
        })
      ).data.pools,
    initialData: [{ id: "general", name: "General" }],
  });
</script>

<Modal bind:showModal bind:dialog>
  <div class="container">
    <input
      bind:value={name}
      style="width:calc(100% - 20px);margin-top:3px;padding:10px;"
      placeholder="Title"
    />
    <select
      class="w-[calc(100%_-_20px)] border-[1px] border-card p-2 mt-2 rounded-sm"
      bind:value={pool}
    >
      {#each $query.data as { id, name }}
        <option value={id}>{name}</option>
      {/each}
    </select>
    <textarea
      bind:value={content}
      style="width:calc(100% - 20px);height:200px;margin-top:10px;font-family:arial;padding:10px;resize:none;"
      placeholder="Content"
    />
    <div style="margin:10px;align-self:flex-start;">
      <label for="files" class="btn">Upload media:</label>
      <input
        id="files"
        type="file"
        class="w-full rounded-xl"
        on:change={(e) => {
          media = e.target.files[0];
        }}
      />
    </div>
    <div
      style="display: flex;
        flex-direction: row;
        gap: 10px;
        justify-content: flex-end;
        align-items: center;"
    >
      <a
        href="javascript:void(0)"
        on:click={() => {
          dialog.close();
        }}>Cancel</a
      >
      <button disabled={addingPost} on:click={addPost}>Submit post</button>
    </div>
  </div>
</Modal>
