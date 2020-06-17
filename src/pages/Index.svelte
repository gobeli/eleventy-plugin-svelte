<script>
  import Button from '../common/Button.svelte'

  const changeName = () => {
    name = name === 'world' ? 'test' : 'world'
  }

  export let name, posts
</script>

<style>
  p {
    margin: 1rem;
    color: #333;
  }
</style>

<p>Hello {name}</p>
<Button on:click={changeName}>Test</Button>
<input bind:value={name} />
<a href="/about">Go to the about page</a>
{#each posts as post}{post.title}{/each}
