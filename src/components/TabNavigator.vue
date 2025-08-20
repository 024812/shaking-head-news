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
  <div class="tab-navigator">
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
    <div class="tab-slider" :style="{ transform: `translateX(${100 * selectedIndex}%)` }"></div>
  </div>
</template>

<style lang="scss" scoped>
@import '../variables';

.tab-navigator {
  position: relative;

  width: 100%;
  margin-bottom: 1rem;
  padding: 4px;
  border-radius: 8px;

  background: rgba(255, 255, 255, 0.1);
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
  gap: 6px;
  align-items: center;
  justify-content: center;

  padding: 8px 12px;
  border-radius: 6px;

  font-size: 0.9em;
  color: rgba(12, 12, 10, 0.7);

  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    font-weight: 500;
    color: $color-accent;
  }
}

.tab-icon {
  width: 16px;
  height: 16px;
  opacity: 0.8;
}

.tab-slider {
  position: absolute;
  z-index: 1;
  top: 4px;
  right: 4px;
  bottom: 4px;
  left: 4px;

  border-radius: 6px;

  background: $color-text-light;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  transition: transform 0.3s ease;
}
</style>
