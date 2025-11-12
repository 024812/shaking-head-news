<template>
  <div class="slider-container">
    <div class="slider-wrapper">
      <input
        ref="sliderRef"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        class="slider"
        :class="sliderClass"
        @input="handleInput"
        @change="handleChange"
      />
      <div class="slider-track">
        <div class="slider-fill" :style="{ width: `${percentage}%` }"></div>
      </div>
    </div>

    <div v-if="showValue" class="slider-value">
      {{ formattedValue }}
    </div>

    <div v-if="showLabels" class="slider-labels">
      <span class="label-min">{{ formattedMin }}</span>
      <span v-if="showValue" class="label-current">{{ formattedValue }}</span>
      <span class="label-max">{{ formattedMax }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

defineOptions({
  name: 'SliderComponent',
})

interface ISliderProps {
  modelValue: number
  min?: number
  max?: number
  step?: number
  showValue?: boolean
  showLabels?: boolean
  format?: (value: number) => string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<ISliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  showValue: true,
  showLabels: true,
  format: (value: number) => value.toString(),
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

const sliderRef = ref<HTMLInputElement>()

const percentage = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100
})

const sliderClass = computed(() => [`slider-${props.size}`, { 'slider-disabled': props.disabled }])

const formattedValue = computed(() => {
  return props.format ? props.format(props.modelValue) : props.modelValue.toString()
})

const formattedMin = computed(() => {
  return props.format ? props.format(props.min) : props.min.toString()
})

const formattedMax = computed(() => {
  return props.format ? props.format(props.max) : props.max.toString()
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value)
  emit('update:modelValue', value)
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value)
  emit('change', value)
}
</script>

<style lang="scss" scoped>
@import '../variables';

/* stylelint-disable order/properties-order */

.slider-container {
  width: 100%;
}

.slider-wrapper {
  position: relative;
  width: 100%;
  padding: 8px 0;
}

.slider {
  position: relative;
  width: 100%;
  height: 6px;
  background: transparent;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
  z-index: 2;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: $color-accent;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(143, 129, 72, 0.4);
    }
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: $color-accent;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(143, 129, 72, 0.4);
    }
  }

  &.slider-sm {
    &::-webkit-slider-thumb {
      width: 16px;
      height: 16px;
    }

    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
    }
  }

  &.slider-lg {
    &::-webkit-slider-thumb {
      width: 24px;
      height: 24px;
    }

    &::-moz-range-thumb {
      width: 24px;
      height: 24px;
    }
  }

  &.slider-disabled {
    cursor: not-allowed;
    opacity: 0.5;

    &::-webkit-slider-thumb {
      cursor: not-allowed;
    }

    &::-moz-range-thumb {
      cursor: not-allowed;
    }
  }
}

.slider-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 6px;
  background: rgba(143, 129, 72, 0.2);
  border-radius: 3px;
  transform: translateY(-50%);
  z-index: 1;
}

.slider-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: $color-accent;
  border-radius: 3px;
  transition: width 0.2s ease;
}

.slider-value {
  text-align: center;
  margin-top: 8px;
  font-weight: 600;
  color: $color-accent;
  font-size: 1.1em;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 0.85em;
  color: rgba(12, 12, 10, 0.7);

  .label-min {
    text-align: left;
  }

  .label-current {
    font-weight: 600;
    color: $color-accent;
  }

  .label-max {
    text-align: right;
  }
}

/* stylelint-enable order/properties-order */
</style>
