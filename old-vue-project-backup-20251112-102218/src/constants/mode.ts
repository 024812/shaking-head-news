import { Mode } from '../types'
import type { IModeConfig } from '../types'
import { randomNumber } from '../helpers/random'

export const MODE_CONFIG: Record<Mode, IModeConfig> = {
  [Mode.Continuous]: {
    turn: () => (Math.random() > 0.5 ? randomNumber(0.05, 0.15) : randomNumber(0.85, 1)),
    isReversed: false,
    interval: 0, // Interval is now managed in useMode composable
  },
  [Mode.Soft]: {
    turn: () => (Math.random() > 0.5 ? randomNumber(0.05, 0.15) : randomNumber(0.85, 1)),
    isReversed: false,
    interval: -1,
  },
}
