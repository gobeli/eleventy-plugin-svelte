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
      title: 'Index',
      pagination: {
        data: 'possums',
        size: 1,
        alias: 'possum'
      },
      permalink: ({ possum }) => `possums/${slug(possum.name)}/`
    }
  }
</script>

<script>
  import Nav from './components/nav.svelte'
</script>

<Nav />
