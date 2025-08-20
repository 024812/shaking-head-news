<template>
  <div class="analytics-dashboard">
    <div class="analytics-header">
      <h3>使用分析</h3>
      <div class="analytics-actions">
        <button class="action-button" @click="refreshData">
          <img src="/icons/blog.svg" alt="Refresh" />
        </button>
        <button class="action-button" @click="exportData">
          <img src="/icons/code.svg" alt="Export" />
        </button>
        <button class="action-button danger" @click="clearData">
          <img src="/icons/close.svg" alt="Clear" />
        </button>
      </div>
    </div>

    <!-- Overview Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalSessions }}</div>
          <div class="stat-label">总会话数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📖</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalNewsRead }}</div>
          <div class="stat-label">阅读新闻数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🔄</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalRotations }}</div>
          <div class="stat-label">旋转次数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatDuration(stats.averageSessionDuration) }}</div>
          <div class="stat-label">平均会话时长</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📰</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.averageNewsPerSession.toFixed(1) }}</div>
          <div class="stat-label">每会话新闻数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.bounceRate.toFixed(1) }}%</div>
          <div class="stat-label">跳出率</div>
        </div>
      </div>
    </div>

    <!-- Usage Charts -->
    <div class="charts-section">
      <div class="chart-container">
        <h4>24小时使用分布</h4>
        <div class="hourly-chart">
          <div
            v-for="(count, hour) in stats.hourlyUsage"
            :key="hour"
            class="hour-bar"
            :style="{ height: `${Math.max(5, (count / Math.max(...stats.hourlyUsage)) * 100)}%` }"
            :title="`${hour}:00 - ${count} 次活动`"
          >
            <span class="hour-label">{{ hour }}</span>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <h4>模式使用情况</h4>
        <div class="mode-chart">
          <div v-for="(count, mode) in stats.modeUsage" :key="mode" class="mode-item">
            <div class="mode-bar">
              <div
                class="mode-fill"
                :style="{ width: `${(count / Math.max(...Object.values(stats.modeUsage))) * 100}%` }"
              ></div>
            </div>
            <span class="mode-label">{{ getModeLabel(mode) }}</span>
            <span class="mode-count">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Popular Sources -->
    <div class="popular-sources">
      <h4>热门新闻源</h4>
      <div class="sources-list">
        <div v-for="source in stats.popularSources.slice(0, 10)" :key="source.source" class="source-item">
          <div class="source-name">{{ source.source }}</div>
          <div class="source-bar">
            <div
              class="source-fill"
              :style="{ width: `${(source.count / stats.popularSources[0]?.count || 1) * 100}%` }"
            ></div>
          </div>
          <div class="source-count">{{ source.count }}</div>
        </div>
      </div>
    </div>

    <!-- Recent Events -->
    <div class="recent-events">
      <h4>最近事件</h4>
      <div class="events-list">
        <div v-for="event in recentEvents.slice(0, 20)" :key="event.id" class="event-item">
          <div class="event-time">{{ formatTime(event.timestamp) }}</div>
          <div class="event-category">{{ event.category }}</div>
          <div class="event-action">{{ event.action }}</div>
          <div v-if="event.label" class="event-label">{{ event.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { analytics, type IAnalyticsStats, type IAnalyticsEvent } from '../services/Analytics'

const stats = reactive<IAnalyticsStats>({
  totalSessions: 0,
  totalPageViews: 0,
  totalInteractions: 0,
  totalNewsRead: 0,
  totalRotations: 0,
  averageSessionDuration: 0,
  averageNewsPerSession: 0,
  bounceRate: 0,
  popularSources: [],
  hourlyUsage: new Array(24).fill(0),
  dailyUsage: {},
  modeUsage: {},
})

const recentEvents = ref<IAnalyticsEvent[]>([])
let refreshInterval: number | null = null

const refreshData = () => {
  Object.assign(stats, analytics.getStats())
  recentEvents.value = analytics.getEvents().sort((a, b) => b.timestamp - a.timestamp)
}

const exportData = () => {
  const data = analytics.exportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const clearData = () => {
  if (confirm('确定要清除所有分析数据吗？此操作不可撤销。')) {
    analytics.clearData().then(() => {
      refreshData()
    })
  }
}

const formatDuration = (ms: number): string => {
  if (ms < 60000) return `${Math.round(ms / 1000)}秒`
  if (ms < 3600000) return `${Math.round(ms / 60000)}分钟`
  return `${Math.round(ms / 3600000)}小时`
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString()
}

const getModeLabel = (mode: string): string => {
  const modeLabels: Record<string, string> = {
    soft: '轻柔模式',
    continuous: '连续模式',
    paused: '暂停模式',
    none: '无模式',
  }
  return modeLabels[mode] || mode
}

onMounted(() => {
  refreshData()
  refreshInterval = window.setInterval(refreshData, 30000) // Refresh every 30 seconds
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style lang="scss" scoped>
@import '../variables';

.analytics-dashboard {
  overflow-y: auto;

  max-height: 80vh;
  padding: 1rem;
  border-radius: 8px;

  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.analytics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  h3 {
    margin: 0;
    font-size: 1.2em;
    color: $color-text;
  }

  .analytics-actions {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  .stat-card {
    display: flex;
    gap: 0.75rem;
    align-items: center;

    padding: 1rem;
    border-radius: 8px;

    background: rgba(255, 255, 255, 0.05);

    .stat-icon {
      font-size: 1.5em;
      opacity: 0.8;
    }

    .stat-content {
      flex: 1;

      .stat-value {
        font-size: 1.3em;
        font-weight: bold;
        line-height: 1.2;
        color: $color-accent;
      }

      .stat-label {
        font-size: 0.8em;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;

  .chart-container {
    padding: 1rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);

    h4 {
      margin: 0 0 1rem 0;
      font-size: 1em;
      color: $color-text;
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.hourly-chart {
  display: flex;
  gap: 2px;
  align-items: flex-end;
  justify-content: space-between;

  height: 120px;

  .hour-bar {
    position: relative;

    flex: 1;

    border-radius: 2px 2px 0 0;

    background: $color-accent;

    transition: all 0.2s ease;

    &:hover {
      opacity: 0.8;
    }

    .hour-label {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);

      font-size: 0.7em;
      color: rgba(255, 255, 255, 0.6);
      white-space: nowrap;
    }
  }
}

.mode-chart {
  .mode-item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.75rem;

    .mode-bar {
      overflow: hidden;
      flex: 1;

      height: 20px;
      border-radius: 10px;

      background: rgba(255, 255, 255, 0.1);

      .mode-fill {
        height: 100%;
        background: $color-accent;
        transition: width 0.3s ease;
      }
    }

    .mode-label {
      min-width: 80px;
      font-size: 0.9em;
      color: $color-text;
    }

    .mode-count {
      min-width: 30px;
      font-size: 0.9em;
      color: rgba(255, 255, 255, 0.7);
      text-align: right;
    }
  }
}

.popular-sources {
  margin-bottom: 2rem;

  h4 {
    margin: 0 0 1rem 0;
    font-size: 1em;
    color: $color-text;
  }

  .sources-list {
    padding: 1rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);

    .source-item {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      margin-bottom: 0.75rem;

      &:last-child {
        margin-bottom: 0;
      }

      .source-name {
        min-width: 120px;
        font-size: 0.9em;
        color: $color-text;
      }

      .source-bar {
        overflow: hidden;
        flex: 1;

        height: 16px;
        border-radius: 8px;

        background: rgba(255, 255, 255, 0.1);

        .source-fill {
          height: 100%;
          background: $color-accent;
          transition: width 0.3s ease;
        }
      }

      .source-count {
        min-width: 30px;
        font-size: 0.9em;
        color: rgba(255, 255, 255, 0.7);
        text-align: right;
      }
    }
  }
}

.recent-events {
  h4 {
    margin: 0 0 1rem 0;
    font-size: 1em;
    color: $color-text;
  }

  .events-list {
    overflow-y: auto;

    max-height: 300px;
    padding: 1rem;
    border-radius: 8px;

    background: rgba(255, 255, 255, 0.05);

    .event-item {
      display: grid;
      grid-template-columns: 80px 100px 1fr auto;
      gap: 0.5rem;

      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      &:last-child {
        border-bottom: none;
      }

      .event-time {
        font-family: monospace;
        font-size: 0.8em;
        color: rgba(255, 255, 255, 0.6);
      }

      .event-category {
        font-size: 0.8em;
        color: $color-accent;
        text-transform: uppercase;
      }

      .event-action {
        font-size: 0.9em;
        color: $color-text;
      }

      .event-label {
        font-size: 0.8em;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
}
</style>
