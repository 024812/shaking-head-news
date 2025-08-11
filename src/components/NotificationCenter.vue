<template>
  <Teleport to="body">
    <Transition name="notifications-fade">
      <div v-if="notifications.length > 0" class="notifications-container">
        <TransitionGroup name="notification" tag="div" class="notifications-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            :class="['notification', `notification--${notification.type}`]"
            :aria-live="notification.type === 'error' ? 'assertive' : 'polite'"
            role="alert"
          >
            <div class="notification__content">
              <div class="notification__icon">
                <span v-if="notification.type === 'success'">✅</span>
                <span v-else-if="notification.type === 'error'">❌</span>
                <span v-else-if="notification.type === 'warning'">⚠️</span>
                <span v-else-if="notification.type === 'info'">ℹ️</span>
              </div>
              
              <div class="notification__text">
                <h4 class="notification__title">{{ notification.title }}</h4>
                <p v-if="notification.message" class="notification__message">
                  {{ notification.message }}
                </p>
              </div>

              <div v-if="notification.actions" class="notification__actions">
                <button
                  v-for="action in notification.actions"
                  :key="action.label"
                  :class="['notification__action', { 'notification__action--primary': action.primary }]"
                  @click="action.action"
                >
                  {{ action.label }}
                </button>
              </div>

              <button
                class="notification__close"
                @click="removeNotification(notification.id)"
                :aria-label="`关闭通知: ${notification.title}`"
              >
                ×
              </button>
            </div>

            <div
              v-if="notification.duration && notification.duration > 0"
              class="notification__progress"
              :style="{ animationDuration: `${notification.duration}ms` }"
            />
          </div>
        </TransitionGroup>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useNotifications } from '../composables/useNotifications'

const { notifications, removeNotification } = useNotifications()
</script>

<style lang="scss" scoped>
@import '../variables';

.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  pointer-events: none;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.notification {
  background: $color-text-light;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  pointer-events: all;
  position: relative;
  
  &--success {
    border-left: 4px solid #22c55e;
  }
  
  &--error {
    border-left: 4px solid $color-danger;
  }
  
  &--warning {
    border-left: 4px solid #f59e0b;
  }
  
  &--info {
    border-left: 4px solid $color-accent;
  }

  &__content {
    display: flex;
    align-items: flex-start;
    padding: 16px;
    gap: 12px;
  }

  &__icon {
    font-size: 18px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  &__text {
    flex-grow: 1;
    min-width: 0;
  }

  &__title {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
    color: $color-text-dark;
    line-height: 1.4;
  }

  &__message {
    margin: 0;
    font-size: 13px;
    color: rgba($color-text-dark, 0.8);
    line-height: 1.4;
    word-wrap: break-word;
  }

  &__actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  &__action {
    padding: 4px 12px;
    border: 1px solid rgba($color-accent, 0.3);
    border-radius: 6px;
    background: transparent;
    color: $color-accent;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba($color-accent, 0.1);
    }

    &--primary {
      background: $color-accent;
      color: $color-text-light;
      border-color: $color-accent;

      &:hover {
        background: rgba($color-accent, 0.9);
      }
    }
  }

  &__close {
    background: none;
    border: none;
    color: rgba($color-text-dark, 0.5);
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    padding: 4px;
    flex-shrink: 0;
    margin-top: -2px;
    
    &:hover {
      color: $color-text-dark;
    }
  }

  &__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: rgba($color-accent, 0.3);
    width: 100%;
    transform-origin: left;
    animation: progress-shrink linear forwards;
  }
}

@keyframes progress-shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

// Transitions
.notifications-fade-enter-active,
.notifications-fade-leave-active {
  transition: opacity 0.3s ease;
}

.notifications-fade-enter-from,
.notifications-fade-leave-to {
  opacity: 0;
}

.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>