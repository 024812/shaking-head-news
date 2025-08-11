import { computed, onBeforeMount, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { MODE_CONFIG } from '../constants/mode'
import { storage } from '../helpers/storage'
import type { IModeConfig, IModeConfigValue } from '../types'
import { Mode } from '../types'
import { useMotionPreferences } from './useMotionPreferences'

const MODE_KEY = 'setting.mode'
const CONTINUOUS_MODE_INTERVAL_KEY = 'setting.continuousModeInterval'

const getConfigValue = ({ turn, isReversed, interval }: IModeConfig): IModeConfigValue => ({
  turn: turn(),
  isReversed,
  interval,
})

export const useMode = () => {
  const mode = ref<Mode>(Mode.Soft)
  const continuousModeInterval = ref(30)
  const isPaused = ref(false) // Manual pause/play control
  const { shouldDisableMotion } = useMotionPreferences()

  const config = computed(() => MODE_CONFIG[mode.value])
  const value = reactive(getConfigValue(config.value))
  let timer: NodeJS.Timeout
  let lastTurnPositive = false

  // Whether rotation should be active (considers both motion preferences and manual pause)
  const shouldRotate = computed(() => {
    return !shouldDisableMotion.value && !isPaused.value && mode.value === Mode.Continuous
  })

  const update = () => {
    const newConfig = getConfigValue(config.value)

    const newTurn = newConfig.turn
    value.turn = lastTurnPositive ? -newTurn : newTurn
    lastTurnPositive = !lastTurnPositive
    value.isReversed = newConfig.isReversed
    value.interval = mode.value === Mode.Continuous ? continuousModeInterval.value : newConfig.interval

    return value
  }

  const clear = () => {
    if (timer) {
      clearTimeout(timer)
      timer = undefined as unknown as NodeJS.Timeout
    }
  }

  const startRotation = () => {
    if (shouldRotate.value && mode.value === Mode.Continuous) {
      const newValue = update()
      timer = setInterval(update, newValue.interval * 1000)
    }
  }

  const togglePause = () => {
    isPaused.value = !isPaused.value
  }

  watch([mode, continuousModeInterval, shouldRotate], () => {
    clear()
    storage.setItem(MODE_KEY, mode.value)
    storage.setItem(CONTINUOUS_MODE_INTERVAL_KEY, continuousModeInterval.value.toString())

    if (shouldRotate.value) {
      startRotation()
    } else {
      // Reset to neutral position when motion is disabled
      value.turn = 0
    }
  })

  onBeforeMount(async () => {
    const storedMode = (await storage.getItem(MODE_KEY)) as Mode | null
    const storedInterval = await storage.getItem(CONTINUOUS_MODE_INTERVAL_KEY)

    mode.value = storedMode ?? Mode.Soft
    if (storedInterval && !isNaN(Number(storedInterval))) {
      continuousModeInterval.value = parseInt(storedInterval, 10)
    }
  })

  onBeforeUnmount(clear)

  return {
    mode,
    continuousModeInterval,
    isPaused,
    shouldDisableMotion,
    shouldRotate,
    togglePause,
    config: value,
  }
}
