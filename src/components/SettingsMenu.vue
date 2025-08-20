<template>
  <div class="settings-container">
    <img src="/icons/settings.svg" alt="Settings" class="icon-button" @click="toggleMenu" />

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

          <!-- RSS Feed Management -->
          <div class="setting-item">
            <label>新闻源管理</label>
            <div class="rss-management">
              <div class="active-feed">
                <label>当前活跃源:</label>
                <select v-model="activeFeedId" @change="setActiveFeed(activeFeedId)">
                  <option v-for="feed in feeds.filter((f: IRssFeed) => f.enabled)" :key="feed.id" :value="feed.id">
                    {{ feed.name }}
                  </option>
                </select>
              </div>

              <div class="rss-controls">
                <button class="manage-button" @click="toggleRssManagement">
                  {{ showRssManagement ? '取消管理' : '管理RSS源' }}
                </button>
              </div>

              <!-- RSS Management Panel -->
              <div v-if="showRssManagement" class="rss-panel">
                <!-- Add New Feed Form -->
                <div class="add-feed-form">
                  <h4>添加新RSS源</h4>
                  <div class="form-group">
                    <input v-model="newFeedName" placeholder="RSS源名称" maxlength="50" />
                    <input v-model="newFeedUrl" placeholder="RSS源地址 (http://...)" type="url" />
                    <div class="form-actions">
                      <button :disabled="isLoading" @click="handleAddFeed">
                        {{ isLoading ? '添加中...' : '添加RSS源' }}
                      </button>
                    </div>
                    <p v-if="feedError" class="error-message">{{ feedError }}</p>
                  </div>
                </div>

                <!-- Existing Feeds List -->
                <div class="feeds-list">
                  <h4>现有RSS源</h4>
                  <div v-if="feeds.length === 0" class="no-feeds">暂无RSS源</div>
                  <div v-for="feed in feeds" :key="feed.id" class="feed-item">
                    <div class="feed-info">
                      <div class="feed-header">
                        <span class="feed-name">{{ feed.name }}</span>
                        <div class="feed-status">
                          <span v-if="feed.error" class="status-error" :title="feed.error">❌</span>
                          <span v-else-if="feed.lastUpdated" class="status-success">✅</span>
                          <span v-else class="status-untested">❓</span>
                        </div>
                      </div>
                      <div class="feed-url">{{ feed.url }}</div>
                      <div v-if="feed.error" class="feed-error">错误: {{ feed.error }}</div>
                    </div>
                    <div class="feed-actions">
                      <button class="toggle-button" :class="{ active: feed.enabled }" @click="toggleFeed(feed.id)">
                        {{ feed.enabled ? '启用' : '禁用' }}
                      </button>
                      <button :disabled="isLoading" class="test-button" @click="handleTestFeed(feed.id)">测试</button>
                      <button class="remove-button" @click="handleRemoveFeed(feed.id)">删除</button>
                    </div>
                  </div>
                </div>
              </div>
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
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModeSelector from './ModeSelector.vue'
import { Mode } from '../types'
import { useLatestUpdate } from '../composables/useLatestUpdateApi'
import { useMode } from '../composables/useMode'
import { useMotionPreferences } from '../composables/useMotionPreferences'
import { useRssFeeds, type IRssFeed } from '../composables/useRssFeeds'

const isOpen = ref(false)
const modelValue = defineModel<Mode>({ required: true })
const { latestUpdate } = useLatestUpdate()
const { continuousModeInterval, isPaused, shouldDisableMotion, shouldRotate, togglePause } = useMode()
const { motionPreferences, prefersReducedMotion, setMotionPreference } = useMotionPreferences()
const { feeds, activeFeedId, isLoading, addFeed, removeFeed, toggleFeed, setActiveFeed, testFeed, init } = useRssFeeds()

// RSS Feed Management State
const showRssManagement = ref(false)
const newFeedName = ref('')
const newFeedUrl = ref('')
const feedError = ref<string | null>(null)

// Initialize RSS feeds on mount
onMounted(() => {
  init()
})

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

// RSS Feed Management Functions
const toggleRssManagement = () => {
  showRssManagement.value = !showRssManagement.value
  if (!showRssManagement.value) {
    // Reset form when closing
    newFeedName.value = ''
    newFeedUrl.value = ''
    feedError.value = null
  }
}

const handleAddFeed = async () => {
  feedError.value = null

  if (!newFeedName.value.trim()) {
    feedError.value = '请输入RSS源名称'
    return
  }

  if (!newFeedUrl.value.trim()) {
    feedError.value = '请输入RSS源地址'
    return
  }

  try {
    const feed = await addFeed(newFeedName.value, newFeedUrl.value)
    // Test the feed after adding
    const isValid = await testFeed(feed.id)
    if (!isValid) {
      feedError.value = '添加的RSS源无法正常访问，请检查地址是否正确'
    } else {
      // Reset form on success
      newFeedName.value = ''
      newFeedUrl.value = ''
      showRssManagement.value = false
    }
  } catch (err) {
    feedError.value = err instanceof Error ? err.message : '添加RSS源失败'
  }
}

const handleRemoveFeed = (feedId: string) => {
  if (confirm('确定要删除这个RSS源吗？')) {
    removeFeed(feedId)
  }
}

const handleTestFeed = async (feedId: string) => {
  await testFeed(feedId)
}
</script>

<style lang="scss" scoped>
@use 'sass:color';

/* stylelint-disable-next-line order/order */
@import '../variables';

.settings-container {
  position: fixed;
  z-index: 9999;
  right: 56px; /* 16px for its own margin + 32px for github icon + 8px spacing */
  bottom: 16px;
}

.icon-button {
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  padding: 4px;
  transition: all 0.2s ease;
  background-color: rgba(255, 255, 255, 0.8);
  border: 2px solid $color-accent;

  &:hover {
    opacity: 0.7;
    background-color: rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: 2px solid #4a90e2;
    outline-offset: 2px;
  }
}

.settings-overlay {
  position: fixed;
  z-index: 10000;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.settings-menu {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 10001;

  overflow-y: auto;

  width: 400px;
  padding: 24px;

  background: #fefdf5; /* $color-text-light */
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  h3 {
    margin: 0;
    color: #8f8148; /* $color-accent */
  }
}

.settings-content {
  .setting-item {
    margin-bottom: 24px;

    label {
      display: block;
      margin-bottom: 12px;
      font-size: 1.1em;
      color: #8f8148; /* $color-accent */
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
        color: #8f8148; /* $color-accent */

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

/* stylelint-disable order/properties-order, no-descending-specificity */
.rss-management {
  .active-feed {
    margin-bottom: 16px;

    label {
      display: block;
      margin-bottom: 8px;
      font-size: 0.9em;
      color: $color-text-dark;
    }

    select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #{$color-accent};
      border-radius: 4px;
      background: #fefdf5; /* $color-text-light */

      color: $color-text-dark;
    }
  }

  .rss-controls {
    margin-bottom: 16px;

    .manage-button {
      cursor: pointer;

      padding: 8px 16px;
      border: 1px solid #{$color-accent};
      border-radius: 20px;

      font-size: 0.9em;
      color: #8f8148; /* $color-accent */

      background: transparent;

      transition: all 0.2s ease;

      &:hover {
        color: $color-text-light;
        background: $color-accent;
      }
    }
  }

  .rss-panel {
    padding: 16px;
    border: 1px solid color.adjust($color-accent, $alpha: -0.7);
    border-radius: 8px;
    background: color.adjust($color-primary, $lightness: -1%);

    .add-feed-form {
      margin-bottom: 24px;

      h4 {
        margin: 0 0 12px;
        color: #8f8148; /* $color-accent */
      }

      .form-group {
        input {
          width: 100%;
          margin-bottom: 8px;
          padding: 8px 12px;
          border: 1px solid #{$color-accent};
          border-radius: 4px;
        }

        .form-actions {
          margin-top: 12px;

          button {
            cursor: pointer;

            padding: 8px 16px;
            border: 1px solid #{$color-accent};
            border-radius: 4px;

            color: $color-text-light;

            background: $color-accent;

            &:hover:not(:disabled) {
              opacity: 0.9;
            }

            &:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
          }
        }

        .error-message {
          margin: 8px 0 0;
          font-size: 0.85em;
          color: $color-danger;
        }
      }
    }

    .feeds-list {
      h4 {
        margin: 0 0 12px;
        color: #8f8148; /* $color-accent */
      }

      .no-feeds {
        padding: 16px;
        font-style: italic;
        text-align: center;
        color: color.adjust($color-text-dark, $alpha: -0.4);
      }

      .feed-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 12px;
        border: 1px solid color.adjust($color-accent, $alpha: -0.8);
        border-radius: 6px;
        background: #fefdf5; /* $color-text-light */

        .feed-info {
          flex-grow: 1;

          .feed-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;

            .feed-name {
              font-weight: 600;
              color: $color-text-dark;
            }

            .feed-status {
              font-size: 1.2em;
            }
          }

          .feed-url {
            font-size: 0.8em;
            color: color.adjust($color-text-dark, $alpha: -0.3);
            word-break: break-all;
          }

          .feed-error {
            margin-top: 4px;
            font-size: 0.8em;
            color: $color-danger;
          }
        }

        .feed-actions {
          display: flex;
          gap: 6px;
          align-items: flex-start;

          button {
            cursor: pointer;

            padding: 4px 8px;
            border: 1px solid;
            border-radius: 4px;

            font-size: 0.8em;

            &.toggle-button {
              border-color: #{$color-accent};
              color: #8f8148; /* $color-accent */
              background: transparent;

              &.active {
                color: $color-text-light;
                background: $color-accent;
              }
            }

            &.test-button {
              border-color: #666;
              color: #666;
              background: transparent;

              &:hover:not(:disabled) {
                color: $color-text-light;
                background: #666;
              }
            }

            &.remove-button {
              border-color: #{$color-danger};
              color: $color-danger;
              background: transparent;

              &:hover {
                color: $color-text-light;
                background: $color-danger;
              }
            }

            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }
        }
      }
    }
  }
}
/* stylelint-enable */

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
      color: #8f8148; /* $color-accent */

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

  /* stylelint-disable-next-line no-descending-specificity */
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

    /* stylelint-disable-next-line no-descending-specificity */
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

    background: #fefdf5; /* $color-text-light */
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
</style>
