<script>
  import * as API from "aws-amplify/api";
  import Icon from "@iconify/svelte";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  const queryClient = useQueryClient();
  const apiClient = API.generateClient();

  const pools = createQuery({
    queryKey: ["pools"],
    queryFn: async () =>
      (
        await apiClient.graphql({
          query: `{pools(order_by: {order: asc}){ id name icon background_color text_color }}`,
        })
      ).data.pools,
    initialData: [],
  });
</script>

<div class="p-2 pt-0">
  <div class="bg-card p-2 xl:rounded-xl flex flex-col gap-2 mb-2">
    <div class="font-bold">Take a dip</div>
    <div>Visit one of our pools to explore a specific community</div>
  </div>
  <div class="flex flex-col flex-wrap gap-2 w-40 h-80">
    {#each $pools.data as pool}
      <a
        href={`/pools/${pool.id}`}
        class={`text-2xl font-bold px-1 rounded-md flex flex-row items-center`}
        style={`color: ${pool.text_color}; background-color: ${pool.background_color};`}
      >
        <Icon icon={`${pool.icon}`} />
        {pool.name}
      </a>
    {/each}
  </div>
</div>
