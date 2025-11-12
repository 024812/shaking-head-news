<template>
  <div class="select-container" :class="{ 'select-disabled': disabled }">
    <div class="select-trigger" :class="{ 'select-open': isOpen }" @click="toggleDropdown">
      <span class="select-value">{{ displayValue }}</span>
      <span class="select-arrow">▼</span>
    </div>

    <div v-if="isOpen" class="select-dropdown">
      <div
        v-for="option in options"
        :key="option.value"
        class="select-option"
        :class="{ 'select-option-selected': isSelected(option) }"
        @click="selectOption(option)"
      >
        <slot name="option" :option="option">
          {{ option.label }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

defineOptions({
  name: 'StyledDropdownComponent',
})

interface ISelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface IStyledDropdownProps {
  modelValue: string | number
  options: ISelectOption[]
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<IStyledDropdownProps>(), {
  placeholder: 'Select an option',
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
}>()

const isOpen = ref(false)

const displayValue = computed(() => {
  const selected = props.options.find((option) => option.value === props.modelValue)
  return selected ? selected.label : props.placeholder
})

const isSelected = (option: ISelectOption) => {
  return option.value === props.modelValue
}

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const selectOption = (option: ISelectOption) => {
  if (!option.disabled) {
    emit('update:modelValue', option.value)
    emit('change', option.value)
    isOpen.value = false
  }
}

const closeDropdown = () => {
  isOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style lang="scss" scoped>
@import '../variables';

/* stylelint-disable order/properties-order, no-duplicate-selectors, no-descending-specificity */

.select-container {
  position: relative;
  width: 100%;

  &.select-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fefdf5;
  border: 1px solid rgba(143, 129, 72, 0.4);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: $color-accent;
    box-shadow: 0 0 0 2px rgba(143, 129, 72, 0.1);
  }

  &.select-open {
    border-color: $color-accent;
    box-shadow: 0 0 0 2px rgba(143, 129, 72, 0.2);
  }

  .select-disabled & {
    cursor: not-allowed;
    background: rgba(12, 12, 10, 0.05);
  }
}

.select-value {
  flex: 1;
  font-size: 0.95em;
  color: $color-text-dark;

  .select-disabled & {
    color: rgba(12, 12, 10, 0.5);
  }
}

.select-arrow {
  font-size: 0.75em;
  color: $color-accent;
  transition: transform 0.2s ease;

  .select-open & {
    transform: rotate(180deg);
  }
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: #fefdf5;
  border: 1px solid rgba(143, 129, 72, 0.4);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.select-option {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.95em;
  color: $color-text-dark;

  &:hover {
    background: rgba(232, 245, 233, 0.3);
  }

  &.select-option-selected {
    background: rgba(143, 129, 72, 0.1);
    color: $color-accent;
    font-weight: 500;
  }
}

// Size variants
.select-container {
  &.select-sm {
    .select-trigger {
      padding: 6px 10px;

      .select-value {
        font-size: 0.85em;
      }

      .select-arrow {
        font-size: 0.65em;
      }
    }

    .select-option {
      padding: 6px 10px;
      font-size: 0.85em;
    }
  }

  &.select-lg {
    .select-trigger {
      padding: 12px 16px;

      .select-value {
        font-size: 1.05em;
      }

      .select-arrow {
        font-size: 0.85em;
      }
    }

    .select-option {
      padding: 12px 16px;
      font-size: 1.05em;
    }
  }
}

/* stylelint-enable order/properties-order, no-duplicate-selectors, no-descending-specificity */
</style>
