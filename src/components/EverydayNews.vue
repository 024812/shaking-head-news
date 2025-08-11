<script setup lang="ts">
import { onMounted } from 'vue'
import { useEverydayNews } from '../composables/useEverydayNews'

const { newsItems, hasNews, loading, error, isFromCache, init, refresh } = useEverydayNews()

onMounted(() => {
  init()
})

const handleRefresh = () => {
  refresh()
}
</script>

<template>
  <div class="everyday-news-container">
    <!-- Loading State -->
    <div v-if="loading && !hasNews" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载新闻...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !hasNews" class="error-state">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button class="retry-button" @click="handleRefresh">
        重新加载
      </button>
    </div>

    <!-- News Content -->
    <div v-else-if="hasNews" class="news-content">
      <!-- Cache indicator -->
      <div v-if="isFromCache" class="cache-indicator" title="此内容来自缓存">
        📦 缓存内容
      </div>
      
      <!-- Loading overlay for background refresh -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-dot"></div>
      </div>

      <!-- News List -->
      <ul class="news-list">
        <li v-for="item in newsItems" :key="item.id" class="news-item">
          {{ item.text }}
        </li>
      </ul>

      <!-- Refresh Button -->
      <button 
        class="refresh-button" 
        @click="handleRefresh"
        :disabled="loading"
        title="刷新新闻"
      >
        {{ loading ? '刷新中...' : '🔄' }}
      </button>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📰</div>
      <p>暂无新闻内容</p>
      <button class="retry-button" @click="handleRefresh">
        重新加载
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../variables';

.everyday-news-container {
  position: relative;
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
}

// Loading State
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  
  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba($color-accent, 0.3);
    border-top: 3px solid $color-accent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  p {
    color: rgba($color-text-dark, 0.7);
    font-size: 0.9rem;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Error State
.error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  
  .error-icon, .empty-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .error-message, p {
    color: $color-text-dark;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
}

.retry-button {
  padding: 8px 16px;
  background: $color-accent;
  color: $color-text-light;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba($color-accent, 0.9);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
}

// News Content
.news-content {
  position: relative;
  
  .cache-indicator {
    display: inline-block;
    padding: 4px 8px;
    background: rgba($color-accent, 0.1);
    color: $color-accent;
    font-size: 0.75rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    border: 1px solid rgba($color-accent, 0.2);
  }
  
  .loading-overlay {
    position: absolute;
    top: 0;
    right: 1rem;
    z-index: 5;
    
    .loading-dot {
      width: 8px;
      height: 8px;
      background: $color-accent;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }
  }
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

// News List
.news-list {
  padding-left: 0;
  list-style-type: none;
  margin-bottom: 2rem;
}

.news-item {
  position: relative;
  margin-bottom: 0.75rem;
  padding-left: 1.2rem;
  font-size: 1rem;
  line-height: 1.5;
  color: $color-text-dark;
  
  &::before {
    content: '•';
    position: absolute;
    top: 0;
    left: 0;
    font-size: 1.2rem;
    line-height: 1.25;
    color: $color-danger;
  }
  
  &:hover {
    color: rgba($color-text-dark, 0.8);
  }
}

// Refresh Button
.refresh-button {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background: rgba($color-accent, 0.9);
  color: $color-text-light;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover:not(:disabled) {
    background: $color-accent;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    animation: rotate 1s linear infinite;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
