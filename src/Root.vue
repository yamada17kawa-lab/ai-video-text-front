<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'Root'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: url('/src/assets/upload.jpg') no-repeat center center fixed;
  background-size: cover;
  min-height: 100vh;
  overflow: hidden;
}
</style>
