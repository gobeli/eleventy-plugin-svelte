<script context="module">
  export const data = () => {
    return {
      layout: 'layouts/main.njk',
      title: 'Index',
      dataFn: data => ({
        collections: {
          all: data.collections.all.map(p => ({ title: p.data.title }))
        }
      })
    }
  }
</script>

<script>
  import Nav from './components/nav.svelte'

  export let collections = {}
</script>

<Nav />

{#each collections.all as obj}
  <h1>{obj.data.title}</h1>
{/each}
