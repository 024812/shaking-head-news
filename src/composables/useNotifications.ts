import { ref, reactive } from 'vue'

export interface INotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
    primary?: boolean
  }>
}

const notifications = ref<INotification[]>([])
let notificationId = 0

const generateId = () => `notification_${++notificationId}`

export const useNotifications = () => {
  const addNotification = (notification: Omit<INotification, 'id'>): string => {
    const id = generateId()
    const newNotification: INotification = {
      id,
      duration: 5000, // Default 5 seconds
      ...notification
    }

    notifications.value.push(newNotification)

    // Auto-remove after duration (unless duration is 0)
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  // Convenience methods for different notification types
  const success = (title: string, message?: string, options?: Partial<INotification>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    })
  }

  const error = (title: string, message?: string, options?: Partial<INotification>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 0, // Errors don't auto-dismiss
      ...options
    })
  }

  const warning = (title: string, message?: string, options?: Partial<INotification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options
    })
  }

  const info = (title: string, message?: string, options?: Partial<INotification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }
}