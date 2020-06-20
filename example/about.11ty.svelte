<script context="module">
  export const data = () => {
    return {
      layout: 'layouts/main.njk',
      title: 'About'
    }
  }
</script>

<script>
  import Nav from './components/nav.svelte'
</script>

<Nav />

<h1>Hello from about</h1>
