<script setup lang="ts">
import ContentView from './views/ContentView.vue'
import SettingsMenu from './components/SettingsMenu.vue'
import { useMode } from './composables/useMode'

const { mode } = useMode()
</script>

<template>
  <ContentView />
  <SettingsMenu v-model="mode" />
  <a href="https://github.com/024812/shaking-head-news" target="_blank" class="github-link">
    <img src="/icons/github.svg" alt="GitHub" />
  </a>
</template>

<style lang="scss">
@import './variables';

.github-link {
  position: fixed;
  right: 16px;
  bottom: 16px;

  opacity: 0.5;

  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }

  img {
    width: 32px;
    height: 32px;
  }
}

h1,
h2,
h3 {
  margin: 0;
  line-height: 1.2;
  text-transform: uppercase;
}

h4 {
  margin: 0.1rem 0 0.2rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.2;
}

a {
  color: $color-text-dark;
}

a:hover {
  color: $color-danger;
}

ul {
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

ul > li {
  padding: 0;
}

ol {
  margin: 0;
  padding: 0;
}

/* --------------------------------------------------------*/
body {
  margin: 0;

  font-family: 'Hiragino Sans GB', 'Microsoft YaHei', 'WenQuanYi Micro Hei', sans-serif;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  background-color: $color-primary;
}

@media screen and (max-height: 439px) {
  :root {
    font-size: 6px;
  }
}

@media screen and (min-height: 440px) and (max-height: 539px) {
  :root {
    font-size: 8px;
  }
}

@media screen and (min-height: 540px) and (max-height: 639px) {
  :root {
    font-size: 10px;
  }
}

@media screen and (min-height: 640px) and (max-height: 739px) {
  :root {
    font-size: 12px;
  }
}

@media screen and (min-height: 740px) and (max-height: 839px) {
  :root {
    font-size: 14px;
  }
}

@media screen and (min-height: 840px) and (max-height: 939px) {
  :root {
    font-size: 15px;
  }
}

@media screen and (min-height: 940px) {
  :root {
    font-size: 16px;
  }
}
</style>
