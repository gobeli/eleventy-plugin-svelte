<script>
  import Button from "../common/Button.svelte";

  const changeName = () => {
    name = name === "world" ? "test" : "world";
  };

  export let name;
</script>

<p>Hello {name}</p>
<Button on:click={changeName}>Test</Button>
<input bind:value={name} />
<a href="/about">Go to the about page</a>