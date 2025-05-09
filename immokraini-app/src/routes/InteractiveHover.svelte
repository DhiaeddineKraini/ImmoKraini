<script lang="ts">
    export let text: string = '';
</script>

<div class="interactive-hover">
    <slot />
</div>

<style>
    .interactive-hover {
        display: inline-block;
        position: relative;
    }

    .interactive-hover :global(*) {
        transition: transform 0.3s ease;
    }

    .interactive-hover:hover :global(*) {
        transform: translateY(-2px);
    }
</style> 