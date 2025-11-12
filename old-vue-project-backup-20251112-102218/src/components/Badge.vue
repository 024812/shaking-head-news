<template>
  <span class="badge" :class="badgeClasses" @click="handleClick">
    <span v-if="icon" class="badge-icon">{{ icon }}</span>
    <span class="badge-content">{{ content }}</span>
    <span v-if="removable" class="badge-remove" @click.stop="handleRemove">×</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'BadgeComponent',
})

interface IBadgeProps {
  content: string
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  removable?: boolean
  icon?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<IBadgeProps>(), {
  variant: 'default',
  size: 'md',
  removable: false,
  icon: '',
  disabled: false,
})

const emit = defineEmits<{
  click: []
  remove: []
}>()

const badgeClasses = computed(() => [
  `badge-${props.variant}`,
  `badge-${props.size}`,
  {
    'badge-removable': props.removable,
    'badge-disabled': props.disabled,
    'badge-clickable': !props.disabled && !props.removable,
  },
])

const handleClick = () => {
  if (!props.disabled && !props.removable) {
    emit('click')
  }
}

const handleRemove = () => {
  if (!props.disabled) {
    emit('remove')
  }
}
</script>

<style lang="scss" scoped>
@import '../variables';

/* stylelint-disable order/properties-order, declaration-block-no-duplicate-properties, no-descending-specificity */

.badge-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;

  width: 16px;
  height: 16px;
  border-radius: 50%;

  font-size: 0.9em;
  line-height: 1;

  color: $color-text-dark;
  background: rgba(0, 0, 0, 0.1);
  opacity: 0;

  transition:
    background 0.2s ease,
    opacity 0.2s ease;
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
    opacity: 1;
  }

  .badge-danger & {
    color: $color-danger;
    background: rgba(220, 38, 38, 0.1);

    &:hover {
      background: rgba(220, 38, 38, 0.2);
    }
  }
}

.badge {
  display: inline-flex;
  gap: 4px;
  align-items: center;

  padding: 4px 8px;
  border-radius: 12px;

  font-size: 0.85em;
  font-weight: 500;
  white-space: nowrap;

  color: $color-text-dark;
  background: rgba(232, 245, 233, 0.2);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &.badge-primary {
    color: $color-accent;
    background: rgba(143, 129, 72, 0.1);
  }

  &.badge-secondary {
    color: $color-text-dark;
    background: rgba(12, 12, 10, 0.1);
  }

  &.badge-success {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.1);
  }

  &.badge-warning {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  }

  &.badge-danger {
    color: $color-danger;
    background: rgba(220, 38, 38, 0.1);
  }

  &.badge-sm {
    padding: 2px 6px;
    padding: 2px 6px;
    border-radius: 10px;
  }

  &.badge-lg {
    padding: 6px 12px;
    padding: 6px 12px;
    border-radius: 14px;
  }

  &.badge-clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  &.badge-removable {
    cursor: default;
    padding-right: 4px;

    &:hover {
      .badge-remove {
        opacity: 1;
      }
    }
  }

  &.badge-disabled {
    cursor: not-allowed;
    opacity: 0.5;

    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
}

.badge-icon {
  font-size: 1em;
}

.badge-content {
  line-height: 1;
}

/* stylelint-enable order/properties-order, declaration-block-no-duplicate-properties, no-descending-specificity */
</style>
