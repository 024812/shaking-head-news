<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useEverydayNews } from '../composables/useEverydayNews'
import ContentCard from './ContentCard.vue'

interface ITodayEventProps {
  date: Date
  isReversed: boolean
}

const props = defineProps<ITodayEventProps>()
const cardRef = ref<InstanceType<typeof ContentCard>>()
const { newsItems, loading, error, hasNews, fetchTodayNews } = useEverydayNews()

const displayItems = computed(() => {
  if (hasNews.value) {
    return newsItems.value.map((item) => item.text)
  }
  if (loading.value) {
    return ['加载中...']
  }
  if (error.value) {
    return [error.value]
  }
  return ['暂无新闻']
})

onMounted(async () => {
  const container = cardRef.value?.containerRef

  if (!container) return

  container.style.display = 'flex'
  container.style.flexDirection = 'column'
  container.style.justifyContent = 'center'

  // Fetch today's news on component mount
  await fetchTodayNews()
})
</script>

<template>
  <ContentCard ref="cardRef" title="每日新闻" :items="displayItems" :is-reversed="props.isReversed" />
</template>
