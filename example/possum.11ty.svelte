<script context="module">
  const slug = str =>
    str
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')

  export const data = () => {
    return {
      layout: 'layouts/main.njk',
      title: 'Possums',
      pagination: {
        data: 'possums',
        size: 1,
        alias: 'possum'
      },
      permalink: ({ possum }) => `possums/${slug(possum.name)}/`,
      dataFn: data => ({
        possum: data.possum
      })
    }
  }
</script>

<script>
  import Nav from './components/nav.svelte'

  export let possum
</script>

<Nav />

<h1>{possum.name}</h1>
