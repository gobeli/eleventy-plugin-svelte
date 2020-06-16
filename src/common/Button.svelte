<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
</script>

<style>
  button {
    appearance: none;
    padding: 0.5rem 1rem;
    background-color: aquamarine;
    border: none;
  }
</style>

<button on:click={e => dispatch('click', e)}>
  <slot />
</button>
