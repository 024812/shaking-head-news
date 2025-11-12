<template>
  <label class="toggle-container" :class="{ 'toggle-disabled': disabled }">
    <input type="checkbox" class="toggle-input" :checked="modelValue" :disabled="disabled" @change="handleChange" />
    <div class="toggle-switch">
      <div class="toggle-slider"></div>
    </div>
    <span v-if="label" class="toggle-label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ToggleSwitchComponent',
})

interface IToggleSwitchProps {
  modelValue: boolean
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<IToggleSwitchProps>(), {
  label: '',
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const handleChange = (event: Event) => {
  if (props.disabled) {
    return
  }
  const target = event.target as HTMLInputElement
  const checked = target.checked
  emit('update:modelValue', checked)
  emit('change', checked)
}
</script>

<style lang="scss" scoped>
@import '../variables';

/* stylelint-disable order/properties-order, no-descending-specificity */

.toggle-container {
  display: inline-flex;
  gap: 8px;
  align-items: center;

  cursor: pointer;
  user-select: none;

  &.toggle-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.toggle-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;

  &:disabled {
    cursor: not-allowed;
  }
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;

  border-radius: 24px;

  background-color: rgba(143, 129, 72, 0.2);
  transition: background-color 0.3s ease;

  .toggle-container:hover & {
    background-color: rgba(143, 129, 72, 0.3);
  }

  .toggle-input:checked + & {
    background-color: $color-accent;
  }

  .toggle-input:disabled + & {
    background-color: rgba(12, 12, 10, 0.3);
    cursor: not-allowed;
  }
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #fefdf5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;

  .toggle-input:checked + .toggle-switch & {
    transform: translateX(24px);
  }
}

.toggle-label {
  color: $color-text-dark;
  font-size: 0.95em;
  font-weight: 500;
}

.toggle-container.toggle-sm .toggle-switch {
  width: 36px;
  height: 18px;
}

.toggle-container.toggle-sm .toggle-switch .toggle-slider {
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;

  .toggle-input:checked + .toggle-switch & {
    transform: translateX(18px);
  }
}

.toggle-container.toggle-sm .toggle-label {
  font-size: 0.85em;
}

.toggle-container.toggle-lg .toggle-switch {
  width: 56px;
  height: 28px;
}

.toggle-container.toggle-lg .toggle-switch .toggle-slider {
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;

  .toggle-input:checked + .toggle-switch & {
    transform: translateX(28px);
  }
}

.toggle-container.toggle-lg .toggle-label {
  font-size: 1.05em;
}

/* stylelint-enable order/properties-order, no-descending-specificity */
</style>
