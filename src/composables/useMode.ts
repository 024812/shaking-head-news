import { computed, onBeforeMount, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { MODE_CONFIG } from '../constants/mode'
import { storage } from '../helpers/storage'
import type { IModeConfig, IModeConfigValue } from '../types'
import { Mode } from '../types'

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
  const config = computed(() => MODE_CONFIG[mode.value])
  const value = reactive(getConfigValue(config.value))
  let timer: NodeJS.Timeout
  let lastTurnPositive = false

  const update = () => {
    const newConfig = getConfigValue(config.value)

    const newTurn = newConfig.turn
    value.turn = lastTurnPositive ? -newTurn : newTurn
    lastTurnPositive = !lastTurnPositive
    value.isReversed = newConfig.isReversed
    value.interval = mode.value === Mode.Continuous ? continuousModeInterval.value : newConfig.interval

    return value
  }

  const clear = () => timer && clearTimeout(timer)

  watch([mode, continuousModeInterval], () => {
    const newValue = update()

    clear()
    storage.setItem(MODE_KEY, mode.value)

    if (newValue.interval > 0) {
      timer = setInterval(update, newValue.interval * 1000)
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

  return { mode, config: value }
}
