<script setup lang="ts">
import { Ref, ref } from 'vue'

interface IContentCardProps {
  title: string
  items: string[]
  isReversed: boolean
  inW3?: boolean
}

interface IContentCardApis {
  containerRef: Ref<HTMLElement | undefined>
  titleRef: Ref<HTMLElement | undefined>
  contentRef: Ref<HTMLElement | undefined>
}

const props = defineProps<IContentCardProps>()
const containerRef = ref<HTMLElement>()
const titleRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()

defineExpose<IContentCardApis>({ containerRef, titleRef, contentRef })
</script>

<template>
  <section ref="containerRef" class="card" :class="{ w3: props.inW3, reversed: props.isReversed }">
    <h2 ref="titleRef" class="title">
      {{ props.title }}
    </h2>
    <section ref="contentRef" class="items">
      <p v-for="(item, index) in props.items" :key="index"><span>&bull; </span>{{ item }}</p>
    </section>
  </section>
</template>

<style lang="scss" scoped>
@import '../variables';

.card {
  overflow: hidden;
  display: flex;
  flex-direction: column;

  width: 100%;
  height: 100%;

  p {
    margin: 0 0 6px 0;
    font-size: 1rem;
    line-height: 1.3;
  }

  .title {
    flex-shrink: 0;

    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 4px solid black;

    font-size: 1.3rem;
    line-height: 1.2;
    color: $color-danger;
  }

  .items {
    overflow-y: auto;
    flex: 1;
    padding-right: 8px;

    /* Custom scrollbar for better UX */
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.3);
    }
  }

  .items span {
    font-weight: bold;
    color: $color-danger;
  }

  &.reversed {
    .title {
      text-align: right;
    }

    .items {
      transform: rotate(0.5turn);
    }
  }

  &.w3 {
    p {
      margin: 0;
      margin-left: 4px;
    }

    .title {
      margin: 0;
      margin-left: 8px;
      padding: 0;
      padding-left: 8px;
      border: none;
      border-left: 8px solid black;
    }
  }
}
</style>
