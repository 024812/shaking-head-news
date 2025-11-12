<template>
  <div class="settings-container">
    <img src="/icons/settings.svg" alt="Settings" class="icon-button" @click="toggleMenu" />

    <div v-if="isOpen" class="settings-overlay" @click="toggleMenu">
      <div class="settings-menu" @click.stop>
        <div class="settings-header">
          <h3>设置</h3>
          <img class="icon-button" src="/icons/close.svg" alt="Close" @click="toggleMenu" />
        </div>

        <!-- Tabbed Navigation -->
        <TabNavigator v-model="activeTab" :tabs="tabs" />

        <div class="settings-content">
          <!-- General Settings Tab -->
          <div v-if="activeTab === 'general'" class="tab-content">
            <div class="settings-card">
              <div class="card-header">
                <h4>模式设置</h4>
                <p>选择您喜欢的新闻浏览模式</p>
              </div>
              <div class="card-content">
                <div class="setting-item">
                  <label>模式</label>
                  <ModeSelector v-model="modelValue" />
                </div>

                <div v-if="modelValue === Mode.Continuous" class="setting-item">
                  <label>连续模式间隔时间</label>
                  <div class="interval-section">
                    <Slider
                      v-model="continuousModeInterval"
                      :min="10"
                      :max="300"
                      :step="5"
                      :format="formatTime"
                      :show-labels="true"
                      @change="handleIntervalChange"
                    />
                    <div class="preset-buttons">
                      <Badge
                        v-for="preset in intervalPresets"
                        :key="preset.value"
                        :content="preset.label"
                        :variant="continuousModeInterval === preset.value ? 'primary' : 'secondary'"
                        size="sm"
                        clickable
                        @click="setPresetInterval(preset.value)"
                      />
                    </div>
                    <p class="interval-hint">推荐：30-60秒适合大多数用户</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- RSS Feed Management Tab -->
          <div v-if="activeTab === 'feeds'" class="tab-content">
            <div class="settings-card">
              <div class="card-header">
                <h4>新闻源管理</h4>
                <p>管理您的RSS新闻源，添加、删除或测试订阅源</p>
              </div>
              <div class="card-content">
                <div class="rss-management">
                  <div class="active-feed">
                    <label>当前活跃源:</label>
                    <StyledDropdown
                      v-model="activeFeedId"
                      :options="activeFeedOptions"
                      @change="(value) => setActiveFeed(String(value))"
                    />
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
                          <ToggleSwitch
                            :model-value="feed.enabled"
                            :label="feed.enabled ? '启用' : '禁用'"
                            size="sm"
                            @update:model-value="toggleFeed(feed.id)"
                          />
                          <button :disabled="isLoading" class="test-button" @click="handleTestFeed(feed.id)">
                            测试
                          </button>
                          <button class="remove-button" @click="handleRemoveFeed(feed.id)">删除</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Cache Management Tab -->
          <div v-if="activeTab === 'cache'" class="tab-content">
            <div class="settings-card">
              <div class="card-header">
                <h4>缓存管理</h4>
                <p>管理缓存数据和性能优化</p>
              </div>
              <div class="card-content">
                <CacheManagerUI />
              </div>
            </div>
          </div>

          <!-- Data Management Tab -->
          <div v-if="activeTab === 'data'" class="tab-content">
            <div class="settings-card">
              <div class="card-header">
                <h4>数据管理</h4>
                <p>导入、导出和管理您的设置数据</p>
              </div>
              <div class="card-content">
                <div class="data-management">
                  <div class="data-actions">
                    <button class="export-button" @click="exportSettings">
                      <img src="/icons/code.svg" alt="Export" />
                      导出设置
                    </button>
                    <button class="import-button" @click="triggerImport">
                      <img src="/icons/blog.svg" alt="Import" />
                      导入设置
                    </button>
                    <input ref="importInput" type="file" accept=".json" style="display: none" @change="handleImport" />
                  </div>

                  <div class="data-info">
                    <p>导出和导入您的所有设置，包括RSS源、偏好设置和缓存数据。</p>
                  </div>

                  <div class="danger-zone">
                    <h4>危险操作</h4>
                    <button class="reset-button" @click="resetAllSettings">重置所有设置</button>
                    <p class="warning-text">此操作将清除所有设置并恢复默认值。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- About Tab -->
          <div v-if="activeTab === 'about'" class="tab-content">
            <template v-if="latestUpdate?.message">
              <div class="settings-card">
                <div class="card-header">
                  <h4>最新动态</h4>
                  <p>了解最新的更新和改进</p>
                </div>
                <div class="card-content">
                  <div class="about-content">
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <p class="about-description" v-html="latestUpdate.message" />
                  </div>
                </div>
              </div>
            </template>
            <div class="settings-card">
              <div class="card-header">
                <h4>关于</h4>
                <p>应用信息和版本详情</p>
              </div>
              <div class="card-content">
                <div class="about-content">
                  <p class="about-description">
                    Shaking Head News is a browser extension that helps you exercise your neck while you read the news.
                  </p>
                  <div class="version-info">
                    <p>版本: {{ version }}</p>
                    <p>构建时间: {{ buildTime }}</p>
                  </div>
                  <div class="links-section">
                    <a href="https://oheng.com" target="_blank" class="link-item">
                      <img src="/icons/blog.svg" alt="Blog" />
                      <span>访问作者博客</span>
                    </a>
                    <a href="https://github.com/024812/shaking-head-news" target="_blank" class="link-item">
                      <img src="/icons/code.svg" alt="GitHub" />
                      <span>GitHub 仓库</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ModeSelector from './ModeSelector.vue'
import TabNavigator from './TabNavigator.vue'
import CacheManagerUI from './CacheManagerUI.vue'
import Slider from './Slider.vue'
import ToggleSwitch from './ToggleSwitch.vue'
import StyledDropdown from './StyledDropdown.vue'
import Badge from './Badge.vue'
import { Mode } from '../types'
import { useLatestUpdate } from '../composables/useLatestUpdateApi'
import { useMode } from '../composables/useMode'
import { useRssFeeds, type IRssFeed } from '../composables/useRssFeeds'
import { storage } from '../helpers/storage'

const isOpen = ref(false)
const modelValue = defineModel<Mode>({ required: true })
const { latestUpdate } = useLatestUpdate()
const { continuousModeInterval } = useMode()
const { feeds, activeFeedId, isLoading, addFeed, removeFeed, toggleFeed, setActiveFeed, testFeed, init } = useRssFeeds()

// Format time function for slider
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds === 0 ? `${minutes}分钟` : `${minutes}分${remainingSeconds}秒`
}

// Active feed options for dropdown
const activeFeedOptions = computed(() => {
  return feeds.value
    .filter((feed: IRssFeed) => feed.enabled)
    .map((feed: IRssFeed) => ({
      value: feed.id,
      label: feed.name,
    }))
})

// Handle interval change
const handleIntervalChange = (value: number) => {
  continuousModeInterval.value = value
}

// Tab Management
const activeTab = ref('general')
const tabs = [
  { id: 'general', label: '常规', icon: '/icons/settings.svg' },
  { id: 'feeds', label: '新闻源', icon: '/icons/blog.svg' },
  { id: 'cache', label: '缓存', icon: '/icons/github.svg' }, // Using github.svg as placeholder
  { id: 'data', label: '数据', icon: '/icons/code.svg' },
  { id: 'about', label: '关于', icon: '/icons/about.svg' },
]

// RSS Feed Management State
const showRssManagement = ref(false)
const newFeedName = ref('')
const newFeedUrl = ref('')
const feedError = ref<string | null>(null)

// Data Management
const importInput = ref<HTMLInputElement | null>(null)
const version = ref('1.0.0')
const buildTime = ref('2024-01-01')

// Initialize on mount
onMounted(async () => {
  await init()
  await loadVersionInfo()
})

// Load version info
const loadVersionInfo = async () => {
  try {
    const manifest = await window.chrome?.runtime?.getManifest()
    if (manifest) {
      version.value = manifest.version
      buildTime.value = new Date().toISOString().split('T')[0]
    }
  } catch (error) {
    console.warn('Failed to load manifest:', error)
  }
}

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

// Data Management Functions
const exportSettings = async () => {
  try {
    const settings = {
      version: version.value,
      exportedAt: new Date().toISOString(),
      rss: {
        feeds: feeds.value,
        activeFeedId: activeFeedId.value,
      },
      mode: {
        current: modelValue.value,
        continuousInterval: continuousModeInterval.value,
      },
      // Include other settings as needed
    }

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shaking-head-news-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export settings:', error)
    alert('导出设置失败')
  }
}

const triggerImport = () => {
  importInput.value?.click()
}

const handleImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const settings = JSON.parse(text)

    // Validate settings structure
    if (!settings.version || !settings.rss) {
      throw new Error('无效的设置文件')
    }

    if (settings.rss) {
      await storage.set('setting.rssFeeds', settings.rss.feeds)
      await storage.set('setting.activeFeed', settings.rss.activeFeedId)
      await init() // Reload feeds
    }

    if (settings.mode) {
      modelValue.value = settings.mode.current || Mode.Continuous
      continuousModeInterval.value = settings.mode.continuousInterval || 30
    }

    alert('设置导入成功')
  } catch (error) {
    console.error('Failed to import settings:', error)
    alert('导入设置失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }

  // Reset file input
  target.value = ''
}

const resetAllSettings = () => {
  if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
    // Clear all storage
    window.chrome?.storage?.local?.clear(() => {
      // Reload the page
      window.location.reload()
    })
  }
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

/* stylelint-disable order/properties-order, declaration-property-value-no-unknown, no-descending-specificity, no-duplicate-selectors */

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

  width: 450px; /* Increased width for tabs */
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

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Card-based Layout */
.settings-card {
  margin-bottom: 24px;
  border-radius: 12px;
  background: #fefdf5; /* $color-text-light */
  box-shadow: 0 2px 8px rgba(143, 129, 72, 0.1);
  border: 1px solid rgba(143, 129, 72, 0.2);
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(143, 129, 72, 0.15);
  }

  .card-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid rgba(143, 129, 72, 0.1);
    background: rgba(232, 245, 233, 0.3); /* $color-primary with opacity */

    h4 {
      margin: 0 0 4px;
      font-size: 1.2em;
      font-weight: 600;
      color: #8f8148; /* $color-accent */
    }

    p {
      margin: 0;
      font-size: 0.9em;
      color: color.adjust($color-text-dark, $alpha: -0.3);
      line-height: 1.4;
    }
  }

  .card-content {
    padding: 24px;

    .setting-item {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      label {
        display: block;
        margin-bottom: 12px;
        font-size: 1em;
        font-weight: 500;
        color: #8f8148; /* $color-accent */
      }
  }
}

.settings-content {
  padding: 8px 0;

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

/* Theme Options */
.theme-options {
  .theme-selector {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 24px;

    .theme-option {
      cursor: pointer;

      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      padding: 12px;
      border-radius: 8px;

      transition: all 0.2s ease;

      &:hover {
        background: color.adjust($color-primary, $lightness: -2%);
      }

      &.active {
        background: color.adjust($color-accent, $alpha: -0.9);
        border: 2px solid $color-accent;
      }

      .theme-preview {
        width: 60px;
        height: 40px;
        border-radius: 4px;
      }

      .theme-name {
        font-size: 0.9em;
        color: $color-text-dark;
      }
    }
  }

  .custom-theme-settings {
    padding: 16px;
    border-radius: 8px;
    background: color.adjust($color-primary, $lightness: -1%);

    .checkbox-item {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      cursor: pointer;

      input[type='checkbox'] {
        margin: 0;
      }

      span {
        font-size: 0.95em;
        color: $color-text-dark;
      }
    }
  }
}

/* Data Management */
.data-management {
  .data-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    button {
      cursor: pointer;

      display: flex;
      align-items: center;
      gap: 8px;

      padding: 10px 16px;
      border: 1px solid #{$color-accent};
      border-radius: 6px;

      font-size: 0.9em;

      background: transparent;
      transition: all 0.2s ease;

      img {
        width: 16px;
        height: 16px;
      }

      &.export-button {
        color: $color-accent;

        &:hover {
          color: $color-text-light;
          background: $color-accent;
        }
      }

      &.import-button {
        color: #666;
        border-color: #666;

        &:hover {
          color: $color-text-light;
          background: #666;
        }
      }
    }
  }

  .data-info {
    margin-bottom: 24px;
    padding: 12px;
    border-radius: 6px;
    background: color.adjust($color-primary, $alpha: -0.5);

    p {
      margin: 0;
      font-size: 0.9em;
      line-height: 1.4;
      color: $color-text-dark;
    }
  }

  .danger-zone {
    padding: 16px;
    border: 1px solid #{$color-danger};
    border-radius: 8px;
    background: color.adjust($color-danger, $alpha: -0.95);

    h4 {
      margin: 0 0 12px;
      color: $color-danger;
    }

    .reset-button {
      cursor: pointer;

      padding: 8px 16px;
      border: 1px solid #{$color-danger};
      border-radius: 4px;

      color: $color-danger;
      background: transparent;

      transition: all 0.2s ease;

      &:hover {
        color: $color-text-light;
        background: $color-danger;
      }
    }

    .warning-text {
      margin: 8px 0 0;
      font-size: 0.85em;
      color: color.adjust($color-danger, $lightness: -10%);
    }
  }
}

/* Version Info */
.version-info {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 6px;
  background: color.adjust($color-primary, $alpha: -0.5);

  p {
    margin: 4px 0;
    font-size: 0.85em;
    color: color.adjust($color-text-dark, $alpha: -0.3);
  }
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

.rss-management {
  .active-feed {
    margin-bottom: 16px;

    label {
      display: block;
      margin-bottom: 8px;
      font-size: 0.9em;
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
          gap: 8px;
          align-items: center;

          .test-button {
            cursor: pointer;

            padding: 4px 8px;
            border: 1px solid #666;
            border-radius: 4px;
            font-size: 0.8em;
            color: #666;
            background: transparent;

            &:hover:not(:disabled) {
              color: $color-text-light;
              background: #666;
            }

            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }

          .remove-button {
            cursor: pointer;

            padding: 4px 8px;
            border: 1px solid #{$color-danger};
            border-radius: 4px;
            font-size: 0.8em;
            color: $color-danger;
            background: transparent;

            &:hover {
              color: $color-text-light;
              background: $color-danger;
            }
          }
        }
      }
    }
  }
}

.interval-section {
  .preset-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 16px 0;
  }

  .interval-hint {
    margin: 16px 0 0;
    padding: 8px 12px;
    font-size: 0.85em;
    line-height: 1.4;
    color: color.adjust($color-text-dark, $alpha: -0.3);
    border-radius: 6px;
    background: rgba(143, 129, 72, 0.1);
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

/* stylelint-enable order/properties-order, declaration-property-value-no-unknown, no-descending-specificity, no-duplicate-selectors */
</style>
