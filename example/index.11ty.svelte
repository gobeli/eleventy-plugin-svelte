<script context="module">
  export const data = () => {
    return {
      layout: 'layouts/main.njk',
      title: 'Index',
      dataFn: data => ({
        collections: {
          all: data.collections.all.map(p => ({ url: p.url, data: { title: p.data.title } }))
        }
      })
    }
  }
</script>

<script>
  import Nav from './components/nav.svelte'

  let name = 'test'

  export let collections = {}
</script>

<Nav />

<h1>{name}</h1>

<input bind:value={name} />

<ul>
  {#each collections.all as obj}
    <li>
      <a href={obj.url}>{obj.data.title}</a>
    </li>
  {/each}
</ul>
