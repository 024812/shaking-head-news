<template>
  <div class="preloader-status" :class="{ active: isPreloaderRunning }">
    <div class="status-icon" :title="statusText">
      <span v-if="isPreloading" class="loading">⏳</span>
      <span v-else-if="hasCache" class="cached">💾</span>
      <span v-else class="idle">📡</span>
    </div>
    <div v-if="showTooltip" class="status-tooltip">
      <div class="tooltip-content">
        <p><strong>News Preloader Status</strong></p>
        <p v-if="isPreloading">Preloading news...</p>
        <p v-else-if="isPreloaderRunning">Preloader is active</p>
        <p v-else>Preloader is idle</p>
        <p v-if="hasCache">Cached news available</p>
        <p v-if="preloaderStats.totalRequests > 0">
          Requests: {{ preloaderStats.successfulRequests }}/{{ preloaderStats.totalRequests }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNewsPreloader } from '../composables/useNewsPreloader'

const { isPreloading, preloaderStats, isPreloaderRunning, activeFeedCacheStatus } = useNewsPreloader()

const showTooltip = ref(false)

const hasCache = computed(() => {
  return activeFeedCacheStatus.value?.hasCache || false
})

const statusText = computed(() => {
  if (isPreloading.value) return 'Preloading news...'
  if (hasCache.value) return 'Cached news available'
  if (isPreloaderRunning.value) return 'Preloader active'
  return 'Preloader idle'
})
</script>

<style lang="scss" scoped>
@import '../variables';

/* stylelint-disable order/properties-order, declaration-property-value-no-unknown */

.preloader-status {
  position: fixed;
  bottom: 16px;
  left: 16px;
  z-index: 1000;

  .status-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba($color-text-dark, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba($color-accent, 0.3);

    &:hover {
      background: rgba($color-text-dark, 0.95);
      border-color: $color-accent;
    }

    span {
      font-size: 18px;
    }

    .loading {
      animation: pulse 1.5s ease-in-out infinite;
    }
  }

  &.active .status-icon {
    border-color: $color-primary;
    box-shadow: 0 0 10px rgba($color-primary, 0.3);
  }

  .status-tooltip {
    position: absolute;
    bottom: 100%;
    left: 0;
    margin-bottom: 8px;
    pointer-events: none;

    .tooltip-content {
      background: rgba($color-text-dark, 0.95);
      border: 1px solid rgba($color-accent, 0.3);
      border-radius: 8px;
      padding: 12px;
      min-width: 200px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

      p {
        margin: 4px 0;
        font-size: 14px;
        color: $color-text-light;

        &:first-child {
          margin-top: 0;
          color: $color-accent;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  &:hover .status-tooltip {
    pointer-events: auto;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* stylelint-enable order/properties-order, declaration-property-value-no-unknown */
</style>
