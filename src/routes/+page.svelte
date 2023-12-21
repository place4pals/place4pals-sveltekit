<script>
  import { useQueryClient, createQuery } from "@tanstack/svelte-query";
  const queryClient = useQueryClient();
  import Squares from "../components/Squares.svelte";
  import Loader from "../components/Loader.svelte";
  import * as API from "aws-amplify/api";
  import { store } from "#src/store";
  import DeletingLoader from "../components/DeletingLoader.svelte";
  import Icon from "@iconify/svelte";
  const apiClient = API.generateClient();

  let pool;
  const query = createQuery({
    queryKey: ["posts"],
    queryFn: async () =>
      (
        await apiClient.graphql({
          query: `{posts(order_by: {created_at: desc}${
            pool ? `, where: {pool_id: {_eq: "${pool}"}}` : ``
          }){
		  		      id
				        created_at
                name
                media
                content
                user { id created_at name image bio }
                pool { id name icon background_color text_color }
                comments(order_by: {created_at: asc}, limit: 25) {
                    id
					          created_at
                    content
                    user { id name image bio }
                }
                numberOfComments: comments_aggregate { a: aggregate { a: count } }
                averageRating: ratings_aggregate { a: aggregate { a: avg { a: rating } }}
			    }}`,
        })
      ).data.posts,
  });
  const showComments = {};
  const localeStringOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  let addingComment = false;
  let deletingId = null;

  const pools = createQuery({
    queryKey: ["pools"],
    queryFn: async () =>
      (
        await apiClient.graphql({
          query: `{pools(order_by: {order: asc}){ id name }}`,
        })
      ).data.pools,
    initialData: [],
  });
</script>

<div class="flex flex-col gap-2">
  {#if $store.intro}
    <div class="bg-card p-2 xl:rounded-xl relative">
      <div class="float-right mr-4">
        <Squares />
      </div>
      <a
        on:click={() => {
          store.update((obj) => ({ ...obj, intro: false }));
        }}
        class="absolute right-2 top-2"
        href="javascript:void(0)">×</a
      >
      <div>
        Welcome to <b>place4pals</b>, a 501(c)(3) registered non-profit social
        media platform.
        <br /><br />
        <a
          href="javascript:void(0)"
          on:click={() => {
            store.update((obj) => ({ ...obj, signupModal: true }));
          }}>Sign up</a
        >
        to start adding posts and comments,
        <a
          href="javascript:void(0)"
          on:click={() => {
            store.update((obj) => ({ ...obj, loginModal: true }));
          }}>login</a
        > if you already have an account, or simply keep lurking below.
      </div>
    </div>
  {/if}
  <div class="bg-card p-2 xl:rounded-xl flex flex-row gap-4">
    <div>
      <label for="pool" class="btn">Pool:</label>
      <select
        bind:value={pool}
        on:change={() => {
          queryClient.refetchQueries({ queryKey: ["posts"] });
        }}
        id="pool"
      >
        {#each [{ id: null, name: "All" }, ...$pools.data] as { id, name }}
          <option value={id}>{name}</option>
        {/each}
      </select>
    </div>
    <div>
      <label for="sort" class="btn">Sort:</label>
      <select id="sort">
        {#each ["Newest", "Highest rating", "Oldest", "Lowest rating"] as obj}
          <option value={obj}>{obj}</option>
        {/each}
      </select>
    </div>
    <div>
      <label for="sort" class="btn">Range:</label>
      <select id="sort">
        {#each ["All time", "Last hour", "Last day", "Last week", "Last month", "Last year"] as obj}
          <option value={obj}>{obj}</option>
        {/each}
      </select>
    </div>
  </div>
  {#if $query.isLoading}
    <Loader />
  {:else}
    {#each $query.data as { id, name, created_at, content, user, comments, media, numberOfComments, averageRating, pool }}
      <div class="bg-card2 p-2 xl:rounded-xl relative">
        {#if user.id === $store.sub}
          <div class="absolute right-2 top-2">
            {#if deletingId === id}
              <DeletingLoader />
            {:else}
              <a
                on:click={async () => {
                  const confirm = window.confirm(
                    `Are you sure you want to delete "${name}"?`
                  );
                  if (confirm) {
                    deletingId = id;
                    await apiClient.graphql({
                      query: `mutation($id: uuid!) {delete_posts_by_pk(id: $id) {id}}`,
                      variables: { id: id },
                    });
                    queryClient.refetchQueries({ queryKey: ["posts"] });
                  }
                }}
                href="javascript:void(0)">×</a
              >
            {/if}
          </div>
        {/if}
        <div class="flex flex-row gap-1">
          <a href={`/users/${user.id.replaceAll("-", "")}`}>
            <img
              alt=""
              src={`https://files.place4pals.com/${
                user.image ?? "profile.jpg"
              }`}
              class="h-[50px] w-[50px] border-[1px] border-text rounded-xl"
            />
          </a>
          <div>
            <div style="font-size:12px;">
              <a style="font-size:20px;" href="/posts/{id.replaceAll('-', '')}"
                >{name.length ? name : "Untitled"}</a
              >
              by
              <a href="/users/{user.id.replaceAll('-', '')}">{user.name}</a>
            </div>
            <div class="flex flex-row gap-1">
              <a
                href={`/pools/${pool.id}`}
                class={`text-xs font-bold px-1 rounded-md flex flex-row items-center`}
                style={`color: ${pool.text_color}; background-color: ${pool.background_color};`}
              >
                <Icon icon={`${pool.icon}`} />
                {pool.name}
              </a>
              <div class="text-xs text-subtitle">
                {new Date(created_at)
                  .toLocaleString("en-US", localeStringOptions)
                  .split(" at ")
                  .map((obj, index) => `${index === 0 ? "🗓️ " : ", 🕐 "}${obj}`)
                  .join("") + " EST"}
              </div>
            </div>
          </div>
        </div>
        <div class="my-2">
          {#if media?.endsWith(".mp4") || media?.endsWith(".mov")}
            <!-- svelte-ignore a11y-media-has-caption -->
            <video class="sm:max-w-[400px] mb-2" controls>
              <source
                src="https://files.place4pals.com/{media}"
                type="video/mp4"
              />
            </video>
          {:else if media}
            <img
              alt="media"
              class="sm:max-w-[400px] mb-2"
              src="https://files.place4pals.com/{media}"
            />
          {/if}
          {#each content.split("\n\n") as paragraph}
            <p>
              {#each paragraph.split("\n") as linebreak}
                {linebreak}<br />
              {/each}
            </p>
          {/each}
        </div>
        <div>
          <a
            href="javascript:void(0)"
            on:click={() => {
              showComments[id] = !showComments[id];
            }}
            >{numberOfComments?.a?.a} comment{numberOfComments?.a?.a !== 1
              ? "s"
              : ""} [{!showComments[id] ? "+" : "-"}]</a
          >
          <span style="margin:0px 5px;">•</span> Rating:
          <div class="inline-flex flex-row items-center">
            {#each [1, 2, 3, 4, 5] as stars}
              <button
                on:click={async () => {
                  await apiClient.graphql({
                    query: `mutation($postId: uuid) {  delete_ratings(where: {parent_id: {_eq: $postId}}) {affected_rows}}`,
                    variables: { postId: id },
                  });
                  await apiClient.graphql({
                    query: `mutation($postId: uuid, $rating: Int) {insert_ratings_one(object: {parent_id: $postId, rating: $rating}) {id}}`,
                    variables: { postId: id, rating: stars },
                  });
                  queryClient.refetchQueries({ queryKey: ["posts"] });
                }}
                class="text-[blue] dark:text-[yellow] cursor-pointer hover:opacity-50 p-0 border-0 bg-transparent"
              >
                {`${averageRating?.a?.a?.a < stars ? "☆" : "★"}`}
              </button>
            {/each}
            <div class="text-xs ml-1">
              ({averageRating?.a?.a?.a?.toFixed(1) ?? 0})
            </div>
          </div>
        </div>
        {#if showComments[id]}
          <div style="margin-top:10px;">
            {#if comments.length === 0}
              <div>No comments</div>
            {:else}
              {#each comments as comment}
                <div
                  style="margin-bottom:5px;"
                  title={new Date(comment.created_at)
                    .toLocaleString("en-US", localeStringOptions)
                    .split(" at ")
                    .map(
                      (obj, index) => `${index === 0 ? "🗓️ " : ", 🕐 "}${obj}`
                    )
                    .join("") + " EST"}
                >
                  <a
                    style="font-weight:bold"
                    href="/users/{comment.user.id.replaceAll('-', '')}"
                    >{comment.user.name}</a
                  >: {comment.content}
                  {#if comment.user.id === $store.sub}
                    {#if deletingId === comment.id}
                      <DeletingLoader />
                    {:else}
                      <a
                        on:click={async () => {
                          deletingId = comment.id;
                          await apiClient.graphql({
                            query: `mutation($id: uuid!) {delete_comments_by_pk(id: $id) { id }}`,
                            variables: { id: comment.id },
                          });
                          queryClient.refetchQueries({ queryKey: ["posts"] });
                        }}
                        style="display: inline-block;"
                        href="javascript:void(0)">×</a
                      >
                    {/if}
                  {/if}
                </div>
              {/each}
            {/if}
            <form
              on:submit={async (e) => {
                e.preventDefault();
                if ($store.sub) {
                  addingComment = true;
                  const formData = new FormData(e.target);
                  await apiClient.graphql({
                    query: `mutation($postId: uuid, $content: String) {insert_comments_one(object: {parent_id: $postId, content: $content}) {id}}`,
                    variables: {
                      postId: id,
                      content: formData.get("comment")?.toString(),
                    },
                  });
                  await queryClient.refetchQueries({ queryKey: ["posts"] });
                  e.target.reset();
                  addingComment = false;
                } else {
                  store.update((obj) => ({ ...obj, signupModal: true }));
                }
              }}
            >
              <input
                disabled={addingComment}
                name="comment"
                style="padding:5px;width:calc(100% - 15px);"
                placeholder="Add a comment"
              />
            </form>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>
