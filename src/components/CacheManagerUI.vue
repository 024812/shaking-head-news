<template>
  <div class="cache-manager-ui">
    <div class="cache-header">
      <h3>缓存管理</h3>
      <div class="cache-actions">
        <button class="action-button" @click="refreshStats">
          <img src="/icons/blog.svg" alt="Refresh" />
        </button>
        <button class="action-button danger" @click="clearCache">
          <img src="/icons/close.svg" alt="Clear" />
        </button>
      </div>
    </div>

    <div class="cache-stats">
      <div class="stat-card">
        <div class="stat-label">缓存命中率</div>
        <div class="stat-value">{{ formatPercentage(stats.hitRate) }}</div>
        <div class="stat-detail">{{ stats.hits }}/{{ stats.totalRequests }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">缓存使用量</div>
        <div class="stat-value">{{ formatSize(stats.size) }}</div>
        <div class="stat-detail">{{ formatPercentage(stats.size / config.maxSize) }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">缓存条目</div>
        <div class="stat-value">{{ stats.entryCount }}/{{ config.maxEntries }}</div>
        <div class="stat-detail">条目数</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">最后清理</div>
        <div class="stat-value">{{ stats.lastCleared ? formatTime(stats.lastCleared) : '从未' }}</div>
        <div class="stat-detail">{{ stats.lastCleared ? formatRelativeTime(stats.lastCleared) : '' }}</div>
      </div>
    </div>

    <div class="cache-config">
      <h4>缓存配置</h4>

      <div class="config-item">
        <label>最大缓存大小</label>
        <select v-model="editableConfig.maxSize" @change="updateConfig">
          <option :value="10 * 1024 * 1024">10 MB</option>
          <option :value="25 * 1024 * 1024">25 MB</option>
          <option :value="50 * 1024 * 1024">50 MB</option>
          <option :value="100 * 1024 * 1024">100 MB</option>
          <option :value="200 * 1024 * 1024">200 MB</option>
        </select>
      </div>

      <div class="config-item">
        <label>最大条目数</label>
        <select v-model="editableConfig.maxEntries" @change="updateConfig">
          <option :value="100">100</option>
          <option :value="500">500</option>
          <option :value="1000">1000</option>
          <option :value="2000">2000</option>
          <option :value="5000">5000</option>
        </select>
      </div>

      <div class="config-item">
        <label>默认TTL</label>
        <select v-model="editableConfig.defaultTTL" @change="updateConfig">
          <option :value="5 * 60 * 1000">5 分钟</option>
          <option :value="15 * 60 * 1000">15 分钟</option>
          <option :value="30 * 60 * 1000">30 分钟</option>
          <option :value="60 * 60 * 1000">1 小时</option>
          <option :value="4 * 60 * 60 * 1000">4 小时</option>
          <option :value="24 * 60 * 60 * 1000">24 小时</option>
        </select>
      </div>

      <div class="config-item">
        <label>清理间隔</label>
        <select v-model="editableConfig.cleanupInterval" @change="updateConfig">
          <option :value="60 * 1000">1 分钟</option>
          <option :value="5 * 60 * 1000">5 分钟</option>
          <option :value="15 * 60 * 1000">15 分钟</option>
          <option :value="30 * 60 * 1000">30 分钟</option>
          <option :value="60 * 60 * 1000">1 小时</option>
        </select>
      </div>
    </div>

    <div v-if="showEntries" class="cache-entries">
      <h4>缓存条目详情</h4>
      <div class="entries-list">
        <div v-for="entry in entries" :key="entry.key" class="entry-item">
          <div class="entry-header">
            <span class="entry-key">{{ entry.key }}</span>
            <span class="entry-size">{{ formatSize(entry.size) }}</span>
          </div>
          <div class="entry-meta">
            <span class="entry-ttl">TTL: {{ formatTTL(entry.ttl) }}</span>
            <span class="entry-age">创建: {{ formatTime(entry.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="cache-actions-bottom">
      <button class="secondary-button" @click="toggleShowEntries">
        {{ showEntries ? '隐藏详情' : '显示条目详情' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { cacheManager, type ICacheStats, type ICacheConfig, type ICacheEntry } from '../services/CacheManager'

const stats = reactive<ICacheStats>({
  hits: 0,
  misses: 0,
  totalRequests: 0,
  hitRate: 0,
  size: 0,
  entryCount: 0,
  lastCleared: null,
})

const config = reactive<ICacheConfig>({
  maxSize: 0,
  maxEntries: 0,
  defaultTTL: 0,
  cleanupInterval: 0,
})

const editableConfig = reactive<Partial<ICacheConfig>>({
  maxSize: 0,
  maxEntries: 0,
  defaultTTL: 0,
  cleanupInterval: 0,
})

const entries = ref<ICacheEntry[]>([])
const showEntries = ref(false)
let statsInterval: number | null = null

const refreshStats = () => {
  const currentStats = cacheManager.getStats()
  const currentConfig = cacheManager.getConfig()

  Object.assign(stats, currentStats)
  Object.assign(config, currentConfig)
  Object.assign(editableConfig, currentConfig)

  if (showEntries.value) {
    entries.value = cacheManager.getAllEntries()
  }
}

const updateConfig = () => {
  cacheManager.updateConfig(editableConfig)
  refreshStats()
}

const clearCache = () => {
  if (confirm('确定要清除所有缓存吗？')) {
    cacheManager.clear()
    refreshStats()
  }
}

const toggleShowEntries = () => {
  showEntries.value = !showEntries.value
  if (showEntries.value) {
    entries.value = cacheManager.getAllEntries()
  }
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatPercentage = (value: number): string => {
  return (value * 100).toFixed(1) + '%'
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString()
}

const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`

  const days = Math.floor(hours / 24)
  return `${days}天前`
}

const formatTTL = (ttl: number): string => {
  const hours = Math.floor(ttl / (60 * 60 * 1000))
  const minutes = Math.floor((ttl % (60 * 60 * 1000)) / (60 * 1000))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

onMounted(() => {
  refreshStats()
  statsInterval = window.setInterval(refreshStats, 1000)
})

onUnmounted(() => {
  if (statsInterval) {
    clearInterval(statsInterval)
  }
})
</script>

<style lang="scss" scoped>
@import '../variables';

.cache-manager-ui {
  padding: 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.cache-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    font-size: 1.2em;
    color: $color-text;
  }

  .cache-actions {
    display: flex;
    gap: 0.5rem;

    .action-button {
      cursor: pointer;

      display: flex;
      align-items: center;
      justify-content: center;

      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;

      background: rgba(255, 255, 255, 0.1);

      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.05);
        background: rgba(255, 255, 255, 0.2);
      }

      &.danger:hover {
        background: rgba(239, 68, 68, 0.2);
      }

      img {
        width: 16px;
        height: 16px;
        opacity: 0.8;
      }
    }
  }
}

.cache-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  .stat-card {
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    background: rgba(255, 255, 255, 0.05);

    .stat-label {
      margin-bottom: 0.5rem;
      font-size: 0.9em;
      color: rgba(255, 255, 255, 0.7);
    }

    .stat-value {
      margin-bottom: 0.25rem;
      font-size: 1.5em;
      font-weight: bold;
      color: $color-accent;
    }

    .stat-detail {
      font-size: 0.8em;
      color: rgba(255, 255, 255, 0.5);
    }
  }
}

.cache-config {
  margin-bottom: 1.5rem;

  h4 {
    margin: 0 0 1rem 0;
    font-size: 1em;
    color: $color-text;
  }

  .config-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;

    label {
      font-size: 0.9em;
      color: rgba(255, 255, 255, 0.8);
    }

    select {
      cursor: pointer;

      padding: 0.5rem 1rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;

      font-size: 0.9em;
      color: $color-text;

      background: rgba(255, 255, 255, 0.1);

      &:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      option {
        background: $color-bg-dark;
      }
    }
  }
}

.cache-entries {
  margin-bottom: 1rem;

  h4 {
    margin: 0 0 1rem 0;
    font-size: 1em;
    color: $color-text;
  }

  .entries-list {
    overflow-y: auto;

    max-height: 300px;
    padding: 0.5rem;
    border-radius: 6px;

    background: rgba(0, 0, 0, 0.2);

    .entry-item {
      margin-bottom: 0.5rem;
      padding: 0.75rem;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.05);

      &:last-child {
        margin-bottom: 0;
      }

      .entry-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5rem;

        .entry-key {
          font-family: monospace;
          font-size: 0.9em;
          color: $color-text;
        }

        .entry-size {
          font-size: 0.8em;
          color: $color-accent;
        }
      }

      .entry-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.8em;

        .entry-ttl,
        .entry-age {
          color: rgba(255, 255, 255, 0.6);
        }
      }
    }
  }
}

.cache-actions-bottom {
  text-align: center;

  .secondary-button {
    cursor: pointer;

    padding: 0.5rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;

    font-size: 0.9em;
    color: $color-text;

    background: rgba(255, 255, 255, 0.1);

    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }
}
</style>
