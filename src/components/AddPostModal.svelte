<script>
  import { compressImage } from "#src/utils";
  import Modal from "../components/Modal.svelte";
  import { API } from "@aws-amplify/api";
  import { useQueryClient } from "@tanstack/svelte-query";
  const queryClient = useQueryClient();
  export let showModal;
  let dialog;
  let addingPost = false;

  const addPost = async () => {
    addingPost = true;
    let mediaKey;
    if (media) {
      const base64 = await compressImage({ file: media });
      mediaKey = await API.post("auth", "/uploadImage", { body: { base64 } });
    }
    await API.graphql({
      query: `mutation($name: String, $content: String, $media: String) { insert_posts(objects: {name: $name, content: $content, media: $media}) {affected_rows}}`,
      variables: { name, content, media: mediaKey },
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
</script>

<Modal bind:showModal bind:dialog>
  <div class="container">
    <input
      bind:value={name}
      style="width:calc(100% - 20px);margin-top:3px;padding:10px;"
      placeholder="Title"
    />
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
