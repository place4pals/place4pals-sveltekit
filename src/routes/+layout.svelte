<script>
	import './styles.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
	<div class="app">
		<main>
			<slot />
		</main>
	</div>
</QueryClientProvider>

<style>
</style>
