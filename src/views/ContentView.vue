<script setup lang="ts">
import { ref, watch } from 'vue'
import DateTime from '../components/DateTime.vue'
import EverydayNews from '../components/EverydayNews.vue'
import { useMode } from '../composables/useMode'
import { useMoment } from '../composables/useMoment'

const { moment } = useMoment()
const { mode, config } = useMode()
const transform = ref(`rotate(${config.turn}turn)`)

watch(config, (n) => (transform.value = `rotate(${n.turn}turn)`))
</script>

<template>
  <main id="container">
    <section id="content">
      <section id="w1">
        <DateTime :date="moment" />
      </section>
      <hr />
      <section id="w2">
        <EverydayNews />
      </section>
    </section>
  </main>
</template>

<style lang="scss" scoped>
#container {
  display: flex;
  align-items: center;
  justify-content: center;

  width: inherit;
  height: inherit;
}

#content {
  transform: v-bind('transform');

  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  box-sizing: border-box;
  width: 70vh;
  height: 70vh;
  margin: auto;
  padding: 1rem;
}

hr {
  flex-shrink: 0;
  width: 100%;
  border: none;
  border-top: 2px solid orange;
  margin: 0;
}

#w1 {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto; /* Do not grow or shrink */
  min-height: 0;
}

#w2 {
  overflow: hidden;
  display: flex;
  align-items: stretch;
  justify-content: center;
  flex: 1 1 auto; /* Grow to fill space */
  min-height: 0;
}

@media (max-width: 820px) {
  #content {
    transform: none;

    width: 90vw;
    min-width: 90vw;
    height: 90vh;
    min-height: 90vh;
  }
}

</style>
