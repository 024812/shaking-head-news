<script setup lang="ts">
import { onMounted } from 'vue'
import { useEverydayNews } from '../composables/useEverydayNews'

const { newsItems, hasNews, loading, error, init } = useEverydayNews()

onMounted(() => {
  init()
})
</script>

<template>
  <div class="everyday-news-container">
    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>
    <ul v-if="hasNews">
      <li v-for="item in newsItems" :key="item.id">{{ item.text }}</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.everyday-news-container {
  overflow-y: auto;
  padding: 1rem;

  ul {
    padding-left: 0;
    list-style-type: none;
  }

  li {
    position: relative;
    margin-bottom: 0.75rem;
    padding-left: 1.2rem;
    font-size: 1rem;
  }

  li::before {
    content: '•';

    position: absolute;
    top: 0;
    left: 0;

    font-size: 1.2rem;
    line-height: 1;
    color: red;
  }
}
</style>
