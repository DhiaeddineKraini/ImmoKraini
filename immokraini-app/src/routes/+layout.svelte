<script lang="ts">
	import '../app.css'; // Import global styles (includes Tailwind)
	import Header from '$lib/components/Header.svelte'; // Import the Header component
</script>

<div class="flex flex-col min-h-screen"> 
  <Header />
  <main class="flex-grow"> 
    <slot /> 
  </main>
</div>