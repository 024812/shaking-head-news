import { ref, onMounted } from 'vue'
import { storage } from '../helpers/storage'

const MOTION_PREFERENCES_KEY = 'setting.motionPreferences'

export interface IMotionPreferences {
  respectSystemPreferences: boolean
  allowMotion: boolean
  showMotionWarning: boolean
}

export const useMotionPreferences = () => {
  const motionPreferences = ref<IMotionPreferences>({
    respectSystemPreferences: true,
    allowMotion: true,
    showMotionWarning: true,
  })

  // Check if user prefers reduced motion from system/browser settings
  const prefersReducedMotion = ref(false)

  // Whether motion should be disabled (system preference OR user setting)
  const shouldDisableMotion = ref(false)

  const checkSystemMotionPreference = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefersReducedMotion.value = mediaQuery.matches

      // Listen for changes
      mediaQuery.addEventListener('change', (e) => {
        prefersReducedMotion.value = e.matches
        updateMotionState()
      })
    }
  }

  const updateMotionState = () => {
    shouldDisableMotion.value =
      (motionPreferences.value.respectSystemPreferences && prefersReducedMotion.value) ||
      !motionPreferences.value.allowMotion
  }

  const setMotionPreference = (key: keyof IMotionPreferences, value: boolean) => {
    motionPreferences.value[key] = value
    updateMotionState()
    savePreferences()
  }

  const savePreferences = async () => {
    await storage.setItem(MOTION_PREFERENCES_KEY, JSON.stringify(motionPreferences.value))
  }

  const loadPreferences = async () => {
    try {
      const stored = await storage.getItem(MOTION_PREFERENCES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        motionPreferences.value = { ...motionPreferences.value, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load motion preferences:', error)
    }
  }

  onMounted(async () => {
    await loadPreferences()
    checkSystemMotionPreference()
    updateMotionState()
  })

  return {
    motionPreferences,
    prefersReducedMotion,
    shouldDisableMotion,
    setMotionPreference,
  }
}
