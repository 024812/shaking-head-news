<script setup lang="ts">
import { ref } from 'vue'
import ModeSelector from './ModeSelector.vue'
import { Mode } from '../types'
import { useLatestUpdate } from '../composables/useLatestUpdateApi'
import { useMode } from '../composables/useMode'
import { useMotionPreferences } from '../composables/useMotionPreferences'

const isOpen = ref(false)
const modelValue = defineModel<Mode>({ required: true })
const { latestUpdate } = useLatestUpdate()
const { continuousModeInterval, isPaused, shouldDisableMotion, shouldRotate, togglePause } = useMode()
const { motionPreferences, prefersReducedMotion, setMotionPreference } = useMotionPreferences()

// Preset interval options (in seconds)
const intervalPresets = [
  { value: 10, label: '10秒' },
  { value: 20, label: '20秒' },
  { value: 30, label: '30秒' },
  { value: 45, label: '45秒' },
  { value: 60, label: '1分钟' },
  { value: 120, label: '2分钟' },
]

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const setPresetInterval = (value: number) => {
  continuousModeInterval.value = value
}
</script>

<template>
  <div class="settings-container">
    <img src="/icons/settings.svg" alt="Settings" class="icon-button" @click="toggleMenu" />

    <Transition name="slide">
      <div v-if="isOpen" class="settings-overlay" @click="toggleMenu">
        <div class="settings-menu" @click.stop>
          <div class="settings-header">
            <h3>设置</h3>
            <img class="icon-button" src="/icons/close.svg" alt="Close" @click="toggleMenu" />
          </div>
          <div class="settings-content">
            <div class="setting-item">
              <label>模式</label>
              <ModeSelector v-model="modelValue" />
            </div>

            <!-- Motion Accessibility Settings -->
            <div class="setting-item">
              <label>动效与无障碍</label>
              <div class="motion-controls">
                <!-- System Motion Preference Warning -->
                <div v-if="prefersReducedMotion" class="motion-warning">
                  <p>⚠️ 检测到您的系统偏好减少动效。页面旋转已自动禁用以保护您的健康。</p>
                </div>

                <!-- Motion Controls -->
                <div class="motion-options">
                  <label class="checkbox-item">
                    <input
                      type="checkbox"
                      :checked="motionPreferences.respectSystemPreferences"
                      @change="
                        setMotionPreference('respectSystemPreferences', ($event.target as HTMLInputElement).checked)
                      "
                    />
                    <span>遵循系统动效偏好设置</span>
                  </label>

                  <label class="checkbox-item">
                    <input
                      type="checkbox"
                      :checked="motionPreferences.allowMotion"
                      @change="setMotionPreference('allowMotion', ($event.target as HTMLInputElement).checked)"
                    />
                    <span>允许页面旋转动效</span>
                  </label>

                  <!-- Pause/Play for Continuous Mode -->
                  <div v-if="modelValue === Mode.Continuous" class="playback-controls">
                    <button :disabled="shouldDisableMotion" @click="togglePause">
                      {{ isPaused ? '▶️ 继续旋转' : '⏸️ 暂停旋转' }}
                    </button>
                  </div>
                </div>

                <!-- Motion Status -->
                <div class="motion-status">
                  <p v-if="shouldDisableMotion" class="status-disabled">🛡️ 页面旋转已禁用 - 保护您免受动效影响</p>
                  <p v-else-if="modelValue === Mode.Continuous && shouldRotate" class="status-active">
                    🔄 页面旋转活跃中
                  </p>
                  <p v-else-if="modelValue === Mode.Continuous && isPaused" class="status-paused">⏸️ 页面旋转已暂停</p>
                </div>
              </div>
            </div>
            <div v-if="modelValue === Mode.Continuous" class="setting-item">
              <label>连续模式间隔时间</label>
              <div class="interval-section">
                <div class="preset-buttons">
                  <button
                    v-for="preset in intervalPresets"
                    :key="preset.value"
                    :class="{ active: continuousModeInterval === preset.value }"
                    @click="setPresetInterval(preset.value)"
                  >
                    {{ preset.label }}
                  </button>
                </div>
                <div class="custom-interval">
                  <label class="custom-label">自定义:</label>
                  <div class="interval-input">
                    <input v-model.number="continuousModeInterval" type="number" min="5" max="300" step="1" />
                    <span>秒</span>
                  </div>
                </div>
                <p class="interval-hint">推荐：30-60秒适合大多数用户</p>
              </div>
            </div>
            <template v-if="latestUpdate?.message">
              <div class="setting-item">
                <label>最新动态</label>
                <div class="about-content">
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <p class="about-description" v-html="latestUpdate.message" />
                </div>
              </div>
            </template>
            <div class="setting-item">
              <label>关于</label>
              <div class="about-content">
                <p class="about-description">
                  Shaking Head News is a browser extension that helps you exercise your neck while you read the news.
                </p>
                <div class="links-section">
                  <a href="https://oheng.com" target="_blank" class="link-item">
                    <img src="/icons/blog.svg" alt="Blog" />
                    <span>访问作者博客</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

/* stylelint-disable-next-line order/order */
@import '../variables';

.settings-container {
  position: fixed;
  z-index: 10;
  right: 56px; /* 16px for its own margin + 32px for github icon + 8px spacing */
  bottom: 16px;
}

.icon-button {
  cursor: pointer;
  width: 28px;
  height: 28px;

  &:hover {
    opacity: 0.7;
  }
}

.settings-overlay {
  position: fixed;
  z-index: 100;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.settings-menu {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;

  overflow-y: auto;

  width: 400px;
  padding: 24px;

  background: $color-text-light;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  h3 {
    margin: 0;
    color: $color-accent;
  }
}

.settings-content {
  .setting-item {
    margin-bottom: 24px;

    label {
      display: block;
      margin-bottom: 12px;
      font-size: 1.1em;
      color: $color-accent;
    }
  }
}

.motion-controls {
  .motion-warning {
    margin-bottom: 16px;
    padding: 12px;
    border-left: 4px solid #{$color-danger};
    border-radius: 6px;

    background: color.adjust($color-danger, $alpha: -0.9);

    p {
      margin: 0;
      font-size: 0.9em;
      line-height: 1.4;
      color: color.adjust($color-danger, $lightness: -10%);
    }
  }

  .motion-options {
    margin-bottom: 16px;

    .checkbox-item {
      cursor: pointer;

      display: flex;
      gap: 8px;
      align-items: center;

      margin-bottom: 12px;

      font-size: 0.95em;
      color: $color-text-dark;

      input[type='checkbox'] {
        margin: 0;
      }

      span {
        line-height: 1.3;
      }
    }

    .playback-controls {
      margin-top: 16px;

      button {
        cursor: pointer;

        padding: 8px 16px;
        border: 1px solid #{$color-accent};
        border-radius: 20px;

        font-size: 0.9em;
        color: $color-accent;

        background: transparent;

        transition: all 0.2s ease;

        &:hover:not(:disabled) {
          color: $color-text-light;
          background: $color-accent;
        }

        /* stylelint-disable-next-line no-descending-specificity */
        &:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      }
    }
  }

  .motion-status {
    p {
      margin: 0;
      padding: 8px 12px;
      border-radius: 4px;

      font-size: 0.85em;
      line-height: 1.4;

      &.status-disabled {
        color: color.adjust($color-danger, $lightness: -5%);
        background: color.adjust($color-danger, $alpha: -0.95);
      }

      &.status-active {
        color: color.adjust($color-accent, $lightness: -5%);
        background: color.adjust($color-accent, $alpha: -0.95);
      }

      &.status-paused {
        color: $color-text-dark;
        background: color.adjust($color-primary, $lightness: -2%);
      }
    }
  }
}

.interval-section {
  /* stylelint-disable-next-line no-descending-specificity */
  .preset-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;

    /* stylelint-disable-next-line no-descending-specificity */
    button {
      cursor: pointer;

      padding: 6px 12px;
      border: 1px solid #{$color-accent};
      border-radius: 16px;

      font-size: 0.9em;
      color: $color-accent;

      background: transparent;

      transition: all 0.2s ease;

      /* stylelint-disable-next-line no-descending-specificity */
      &:hover {
        background: color.adjust($color-accent, $alpha: -0.9);
      }

      &.active {
        color: $color-text-light;
        background: $color-accent;
      }
    }
  }

  .custom-interval {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;

    .custom-label {
      margin: 0;
      font-size: 0.9em;
      color: $color-text-dark;
    }
  }

  .interval-hint {
    margin: 0;
    font-size: 0.8em;
    line-height: 1.4;
    color: color.adjust($color-text-dark, $alpha: -0.3);
  }
}

.interval-input {
  display: flex;
  gap: 8px;
  align-items: center;

  input {
    width: 80px;
    padding: 8px 12px;
    border: 1px solid #{$color-accent};
    border-radius: 2px;

    text-align: center;
  }

  /* stylelint-disable-next-line no-descending-specificity */
  span {
    color: $color-text-dark;
  }
}

.about-content {
  .about-description {
    margin: 0 0 24px;
    line-height: 1.5;
    color: $color-text-dark;
  }
}

.links-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-source-content {
  .data-source-description {
    margin: 0 0 24px;
    line-height: 1.5;
    color: $color-text-dark;
  }

  .data-source-input {
    display: flex;
    gap: 12px;

    input {
      flex-grow: 1;
      padding: 8px 12px;
      border: 1px solid #{$color-accent};
      border-radius: 2px;
    }
  }
}

.link-item {
  display: flex;
  gap: 12px;
  align-items: center;

  padding: 12px;
  border-radius: 6px;

  color: $color-text-dark;
  text-decoration: none;

  transition: background-color 0.2s ease;

  img {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: color.adjust($color-primary, $lightness: -2%);
  }
}

.support-options {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.qr-section {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.qr-item {
  img {
    width: 180px;
    height: 180px;
    padding: 8px;
    border-radius: 12px;

    background: $color-text-light;
    box-shadow: 0 2px 12px #{$color-shadow};

    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px color.adjust($color-shadow, $alpha: 0.1);
    }
  }
}

// Slide animation
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}
</style>
