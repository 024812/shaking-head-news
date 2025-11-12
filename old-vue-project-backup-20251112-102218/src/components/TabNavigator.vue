<script setup lang="ts">
import { computed } from 'vue'

interface ITab {
  id: string
  label: string
  icon?: string
}

interface ITabNavigatorProps {
  tabs: ITab[]
  modelValue: string
}

const props = defineProps<ITabNavigatorProps>()
const emit = defineEmits(['update:modelValue'])

const selectedIndex = computed(() => props.tabs.findIndex((tab) => tab.id === props.modelValue))

const selectTab = (tab: ITab) => {
  emit('update:modelValue', tab.id)
}
</script>

<template>
  <div class="tab-navigator" :style="{ '--tab-count': tabs.length }">
    <div class="tab-list">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.id"
        :class="['tab-item', { active: index === selectedIndex }]"
        @click="selectTab(tab)"
      >
        <img v-if="tab.icon" :src="tab.icon" :alt="tab.label" class="tab-icon" />
        <span>{{ tab.label }}</span>
      </div>
    </div>
    <div class="tab-indicator" :style="{ transform: `translateX(${100 * selectedIndex}%)` }"></div>
  </div>
</template>

<style lang="scss" scoped>
@import '../variables';

.tab-navigator {
  position: relative;

  width: 100%;
  margin-bottom: 1.5rem;
  padding: 6px;
  border: 1px solid rgba(143, 129, 72, 0.2);
  border-radius: 12px;

  background: rgba(232, 245, 233, 0.3); /* $color-primary with opacity */
}

.tab-list {
  position: relative;
  z-index: 2;
  display: flex;
}

.tab-item {
  cursor: pointer;

  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  justify-content: center;

  padding: 12px 16px;
  border-radius: 8px;

  font-size: 0.9em;
  font-weight: 500;
  color: rgba(12, 12, 10, 0.6);
  text-align: center;

  transition: all 0.3s ease;

  &:hover {
    color: $color-accent;
    background: rgba(255, 255, 255, 0.2);
  }

  &.active {
    color: #fefdf5; /* $color-text-light */
  }
}

.tab-icon {
  width: 18px;
  height: 18px;
  opacity: 0.8;
  transition: all 0.2s ease;

  .tab-item.active & {
    opacity: 1;
  }
}

.tab-indicator {
  position: absolute;
  z-index: 1;
  top: 6px;
  bottom: 6px;

  width: calc(100% / var(--tab-count));
  border-radius: 8px;

  background: $color-accent;
  box-shadow: 0 2px 8px rgba(143, 129, 72, 0.3);

  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
